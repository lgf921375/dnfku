/** Original V4 input-and-animation time-line laboratory. No upstream code or DNF assets.
 * Attack windup/active/recovery times below are experimental, not official DNF values.
 * The V3 CombatArena remains the authoritative victim physics and hit validator.
 */
import { CombatArena, ATTACKS } from './combat-core.mjs';

export const ACTION_FRAMES = Object.freeze({
  launcher: Object.freeze({ startup:0.10, active:0.07, recovery:0.18 }),
  airTap: Object.freeze({ startup:0.06, active:0.07, recovery:0.13 }),
  groundSweep: Object.freeze({ startup:0.07, active:0.06, recovery:0.16 }),
  highSlash: Object.freeze({ startup:0.09, active:0.06, recovery:0.18 })
});
export const ACTION_SETTINGS = Object.freeze({ inputBufferSeconds:0.20, bilateralHitstop:true });

export class CombatActionController {
  constructor({ arena, actionSettings, frames } = {}) {
    this.arena = arena ?? new CombatArena();
    this.cfg = { ...ACTION_SETTINGS, ...actionSettings };
    this.frames = { ...ACTION_FRAMES, ...frames };
    this.time = 0;
    this.accumulator = 0;
    this.actionTime = 0;
    this.action = null;
    this.buffer = null;
    this.attackerHitstopRemaining = 0;
    this.events = [];
  }
  get phase() { return this.action?.phase ?? 'idle'; }
  get actionName() { return this.action?.name ?? null; }
  snapshot() { return {
    time:this.time, actionTime:this.actionTime, phase:this.phase, action:this.actionName,
    buffered:this.buffer?.name ?? null, attackerHitstopRemaining:this.attackerHitstopRemaining,
    target:this.arena.snapshot()
  }; }
  record(type, fields={}) { const e={type, time:Number(this.time.toFixed(5)), ...fields}; this.events.push(e); return e; }
  /** Inputs begin their STARTUP animation immediately, never apply instant damage. */
  press(name) {
    if (!Object.hasOwn(ATTACKS,name) || !this.frames[name]) throw new RangeError(`unknown action ${name}`);
    if (!this.action) { this.start(name); return this.record('input-started',{name}); }
    if (this.cfg.inputBufferSeconds<=0) return this.record('input-rejected',{name,reason:'busy'});
    // Replacement policy: the most recent input owns the one-slot buffer.
    this.buffer={ name, expiresAt:this.actionTime+this.cfg.inputBufferSeconds };
    return this.record('input-buffered',{name,phase:this.phase});
  }
  start(name) {
    const f=this.frames[name];
    for (const k of ['startup','active','recovery']) {
      if (!Number.isFinite(f[k]) || f[k]<0) throw new RangeError(`bad ${k} duration`);
    }
    this.action={name,phase:'startup',elapsed:0,impactDone:false};
    this.record('phase',{name,phase:'startup'});
  }
  applyImpact() {
    if (!this.action || this.action.impactDone) return;
    this.action.impactDone=true;
    const result=this.arena.hit(this.action.name);
    this.record('impact',{name:this.action.name,result:result.type,reason:result.reason??null});
    if (result.type==='hit') {
      const period=this.arena.hitstopRemaining;
      if (this.cfg.bilateralHitstop) this.attackerHitstopRemaining=period;
    }
  }
  nextPhase() {
    if (!this.action) return;
    const a=this.action;
    if (a.phase==='startup') {
      a.phase='active';a.elapsed=0;
      this.record('phase',{name:a.name,phase:'active'});
      this.applyImpact();
    } else if (a.phase==='active') {
      a.phase='recovery';a.elapsed=0;
      this.record('phase',{name:a.name,phase:'recovery'});
    } else {
      this.record('action-end',{name:a.name});
      this.action=null;
      if (this.buffer) {
        const pending=this.buffer;this.buffer=null;
        if (this.actionTime <= pending.expiresAt+1e-9) {
          this.start(pending.name);
          this.record('input-consumed',{name:pending.name});
        } else this.record('input-expired',{name:pending.name});
      }
    }
  }
  fixedTick() {
    const dt=this.arena.cfg.fixedStep;
    this.time+=dt;
    // Both channels always share a monotonic simulation clock.
    const frozen=this.cfg.bilateralHitstop && this.attackerHitstopRemaining>0;
    this.arena.tick(dt);
    if (frozen) {
      this.attackerHitstopRemaining=Math.max(0,this.attackerHitstopRemaining-dt);
      return;
    }
    this.attackerHitstopRemaining=0;
    this.actionTime+=dt;
    if (!this.action) return;
    // Each fixed tick may cross a single phase boundary: no double-hit at phase edges.
    const maxStep=this.frames[this.action.name][this.action.phase];
    this.action.elapsed+=dt;
    if (this.action.elapsed+1e-9>=maxStep) this.nextPhase();
  }
  tick(seconds) {
    if (!Number.isFinite(seconds)||seconds<0||seconds>5) throw new RangeError('invalid tick duration');
    this.accumulator+=seconds;
    const dt=this.arena.cfg.fixedStep;
    while(this.accumulator+1e-10>=dt) {
      this.accumulator-=dt;
      if (this.accumulator<0)this.accumulator=0;
      this.fixedTick();
    }
    return this.snapshot();
  }
}
