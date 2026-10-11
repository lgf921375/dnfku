/** Original V5 action-interruption policy. No DNF resources or damage formulas.
 * Super armor prevents an ACTION interruption only; it is not damage immunity.
 */
import { CombatActionController } from './combat-actions.mjs';
import { ATTACKS } from './combat-core.mjs';

export const INTERRUPT_SETTINGS = Object.freeze({
  cancelEnabled: true,
  cancelRecoveryAfter: 0.10,
  cancelRules: Object.freeze({
    launcher: ['airTap'],
    airTap: ['launcher'],
    groundSweep: ['launcher'],
    highSlash: []
  }),
  armoredActions: ['launcher']
});

export class CombatInterruptController extends CombatActionController {
  constructor({ interruptSettings, ...options } = {}) {
    super(options);
    this.policy = { ...INTERRUPT_SETTINGS, ...interruptSettings };
    if (!Number.isFinite(this.policy.cancelRecoveryAfter) || this.policy.cancelRecoveryAfter < 0)
      throw new RangeError('cancelRecoveryAfter must be a finite nonnegative duration');
  }
  get armored() {
    return this.phase === 'active' && this.policy.armoredActions.includes(this.actionName);
  }
  canCancelInto(name) {
    return !!this.action && this.policy.cancelEnabled && this.phase === 'recovery' &&
      this.action.elapsed + 1e-9 >= this.policy.cancelRecoveryAfter &&
      (this.policy.cancelRules[this.actionName] ?? []).includes(name);
  }
  press(name) {
    if (!Object.hasOwn(ATTACKS, name) || !this.frames[name]) throw new RangeError(`unknown action ${name}`);
    if (this.canCancelInto(name)) {
      const from = this.actionName;
      this.action = null;
      this.buffer = null; // never replay an outdated input after a cancel.
      this.record('action-canceled', { from, to: name });
      this.start(name);
      return this.record('cancel-input-started', { from, name });
    }
    return super.press(name);
  }
  /** Caller only reports a validated incoming hit; no HP/damage calculations here. */
  receiveHit({force=false}={}) {
    if (this.armored && !force) {
      return this.record('armor-resisted', { name:this.actionName, phase:this.phase });
    }
    if (!this.action) return this.record('incoming-hit-idle', {});
    const old = this.actionName;
    this.action = null;
    this.buffer = null;
    this.attackerHitstopRemaining = 0;
    return this.record('action-interrupted', { name:old, force:!!force });
  }
  snapshot() { return { ...super.snapshot(), armored:this.armored, cancelReady:this.action !== null && this.phase==='recovery' && this.action.elapsed >= this.policy.cancelRecoveryAfter }; }
}
