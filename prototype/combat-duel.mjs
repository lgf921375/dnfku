/** Original V6 two-fighter laboratory. All damage/guard values are experimental. */
import { CombatArena, ATTACKS, SETTINGS } from './combat-core.mjs';
import { CombatInterruptController } from './combat-interrupts.mjs';

export const DUEL_SKILLS = Object.freeze(Object.fromEntries(Object.entries(ATTACKS).map(([name, def]) => [name,
  Object.freeze({ damage: {launcher:18, airTap:10, groundSweep:8, highSlash:14}[name],
    hitstun:0.18, force:false, boxes:[Object.freeze({from:0, to:1, ...def})] })])));

class DuelActionController extends CombatInterruptController {
  // V4's single impact is replaced with continuous active-window checks by the duel.
  applyImpact() {}
  start(name) { super.start(name); this.action.contacts = new Set(); }
}

export class CombatDuel {
  constructor({ settings={}, skills={}, frames, interruptSettings, bilateralHitstop=true, hp=200 }={}) {
    this.settings={...SETTINGS,...settings};
    if (!Number.isFinite(this.settings.fixedStep) || this.settings.fixedStep<=0 || this.settings.fixedStep>0.1)
      throw new RangeError('invalid fixedStep');
    if (!Number.isFinite(hp) || hp<=0) throw new RangeError('invalid HP');
    this.skills={...DUEL_SKILLS,...skills};
    for (const s of Object.values(this.skills)) {
      if (!Number.isFinite(s.damage)||s.damage<0||!Number.isFinite(s.hitstun)||s.hitstun<0||!s.boxes?.length)
        throw new RangeError('invalid skill');
      for (const b of s.boxes) if (![b.from,b.to,b.x0,b.x1,b.y0,b.y1].every(Number.isFinite) ||
        b.from<0||b.to>1||b.from>=b.to||b.x0>=b.x1||b.y0>=b.y1) throw new RangeError('invalid hitbox');
    }
    this.time=0; this.accumulator=0; this.events=[];
    this.fighters=['A','B'].map((id,i)=>{
      const body=new CombatArena(this.settings); body.enemyX=i*0.8;
      // Each body retains V3 physics/protection; controller clocks advance centrally once.
      const facade={cfg:this.settings,tick(){},snapshot:()=>body.snapshot()};
      const controller=new DuelActionController({arena:facade,frames,interruptSettings,
        actionSettings:{bilateralHitstop}});
      return {id,body,controller,facing:i===0?1:-1,hp,maxHp:hp,guard:false,stun:0,dead:false};
    });
  }
  fighter(id) { const f=this.fighters.find(f=>f.id===id); if(!f)throw new RangeError('unknown fighter');return f; }
  record(type,detail={}) {const e={time:Number(this.time.toFixed(5)),type,...detail};this.events.push(e);return e;}
  press(id,name) {
    const f=this.fighter(id);
    if(f.dead||f.stun>0||!['idle','invulnerable'].includes(f.body.state)||f.guard)
      return this.record('input-rejected',{id,reason:'cannot-act'});
    return f.controller.press(name);
  }
  setGuard(id,on) {
    const f=this.fighter(id);
    if(on&&(f.dead||f.stun>0||f.body.state!=='idle'||f.controller.action)) return false;
    f.guard=!!on;return true;
  }
  move(id,dx) {
    if(!Number.isFinite(dx))throw new RangeError('invalid movement');
    const f=this.fighter(id);
    if(f.dead||f.stun>0||f.body.hitstopRemaining>0||f.controller.attackerHitstopRemaining>0||f.controller.action||f.body.state!=='idle')return false;
    f.body.enemyX+=dx;if(dx)f.facing=Math.sign(dx);return true;
  }
  attackBoxes(f) {
    const a=f.controller.action;
    if(!a||a.phase!=='active'||f.dead)return [];
    const ratio=a.elapsed/f.controller.frames[a.name].active;
    return this.skills[a.name].boxes.filter(b=>ratio+1e-9>=b.from&&ratio<b.to).map(b=>{
      const x=f.body.enemyX,y=f.body.y;
      return {x0:x+(f.facing>0?b.x0:-b.x1),x1:x+(f.facing>0?b.x1:-b.x0),y0:y+b.y0,y1:y+b.y1};
    });
  }
  fixedTick() {
    const dt=this.settings.fixedStep;this.time+=dt;
    const frozen=new Set(this.fighters.filter(f=>f.body.hitstopRemaining>0||f.controller.attackerHitstopRemaining>0));
    for(const f of this.fighters) {
      f.body.fixedTick();
      if(!frozen.has(f))f.stun=Math.max(0,f.stun-dt);
      if(f.dead)continue;
      // Freeze victim action as well as physics. The V5 controller handles attacker freeze.
      if(frozen.has(f)&&f.controller.attackerHitstopRemaining<=0) {f.controller.time+=dt;continue;}
      f.controller.fixedTick();
    }
    // Capture both intents before resolving: equal-tick contacts trade, independent of A/B order.
    const intents=[];
    for(const f of this.fighters) {
      if(frozen.has(f))continue;
      const a=f.controller.action;if(!a||a.phase!=='active'||f.dead)continue;
      const target=this.fighters.find(t=>t!==f);const b=target.body;
      if(target.dead||a.contacts.has(target.id)||b.state==='invulnerable'||
        !ATTACKS[a.name].allowed.includes(b.state)||b.time-b.lastHitTime<this.settings.minHitIntervalSeconds-1e-9)continue;
      const box=this.attackBoxes(f).find(box=>b.overlap(box,b.enemyBox()));
      if(box)intents.push({f,target,a,box,armored:target.controller.armored,
        guarded:target.guard&&b.state==='idle'&&(f.body.enemyX-b.enemyX)*target.facing>=0});
    }
    for(const intent of intents)this.resolve(intent);
  }
  resolve({f,target,a,box,armored,guarded}) {
    const s=this.skills[a.name],b=target.body;a.contacts.add(target.id);
    if(guarded) {
      // Original guard policy: frontal grounded guard has no chip, combo or hitstop.
      this.record('guard',{attacker:f.id,target:target.id,skill:a.name});return;
    }
    const before={state:b.state,y:b.y,vy:b.vy,downRemaining:b.downRemaining,bounceRemaining:b.bounceRemaining};
    const original=b.attackBox;b.attackBox=()=>box;
    let result;try {result=b.hit(a.name);} finally {b.attackBox=original;}
    if(result.type!=='hit') {this.record('rejected-contact',{reason:result.reason});return;}
    // Armor blocks reaction, not damage, combo accounting or threshold protection.
    const protectedStand=b.state==='invulnerable';
    if(armored&&!s.force&&!protectedStand)Object.assign(b,before);
    target.hp=Math.max(0,target.hp-s.damage);
    const reaction=target.controller.receiveHit({force:s.force||protectedStand});
    if(!armored||s.force||protectedStand) {
      target.guard=false;target.stun=protectedStand?0:s.hitstun;
      target.controller.buffer=null;
    }
    const stop=b.hitstopRemaining;
    if(f.controller.cfg.bilateralHitstop)f.controller.attackerHitstopRemaining=Math.max(f.controller.attackerHitstopRemaining,stop);
    this.record('damage',{attacker:f.id,target:target.id,skill:a.name,damage:s.damage,hp:target.hp,
      armored:armored&&!s.force&&!protectedStand,interrupted:reaction.type==='action-interrupted',protectedStand});
    if(target.hp===0) {
      target.dead=true;target.guard=false;target.stun=0;target.controller.receiveHit({force:true});
      target.controller.buffer=null;b.state='dead';b.y=0;b.vy=0;b.hitstopRemaining=0;
      this.record('defeated',{id:target.id});
    }
  }
  tick(seconds) {
    if(!Number.isFinite(seconds)||seconds<0||seconds>5)throw new RangeError('invalid tick');
    this.accumulator+=seconds;
    while(this.accumulator+1e-10>=this.settings.fixedStep){this.accumulator=Math.max(0,this.accumulator-this.settings.fixedStep);this.fixedTick();}
    return this.snapshot();
  }
  snapshot() {return {time:this.time,fighters:this.fighters.map(f=>({id:f.id,hp:f.hp,maxHp:f.maxHp,facing:f.facing,
    guard:f.guard,stun:f.stun,dead:f.dead,body:f.body.snapshot(),action:f.controller.snapshot(),boxes:this.attackBoxes(f)}))};}
}
