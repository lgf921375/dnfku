/** Original demo controller. It drives the unchanged S7 core with ordinary
 * attacks and idle movement; it never resets HP, forces victim states or hits.
 * Auto-approach speed and cycle bounds are demo UX, not DNF measurements.
 */
export const S9_COMBO_HELPER=Object.freeze({step:1/120,walkSpeed:260,downSpacing:32,standingSpacing:45,maxCycles:4,maxSeconds:8});
export class SummonerComboS9{
 constructor(motion){this.motion=motion;this.run=null;this.accumulator=0;}
 get active(){return !!this.run&&!this.run.done;}
 start(){const m=this.motion;if(m.paused||m.action)throw new Error('Start the demo from a fresh unpaused fixture');
  this.accumulator=0;this.run={done:false,phase:'attack',cycle:1,completed:0,started:m.feedbackTime,eventCursor:m.events.length,reason:null,approachDistance:0};
  m.setHeld(false);m.queue=false;m.replay=true;m.start(0);m.record('combo-demo-start',{originalHelper:true,initialState:m.target.state});return this.run;
 }
 release(){const m=this.motion;m.replay=false;m.setHeld(false);m.queue=false;}
 cancel(reason='manual'){if(!this.active)return;this.release();this.finish(reason);}
 finish(reason){this.run.done=true;this.run.phase='done';this.run.reason=reason;this.release();this.motion.record('combo-demo-done',{reason,completed:this.run.completed,cycle:this.run.cycle});}
 settle(reason){this.release();this.run.phase='settle';this.run.reason=reason;}
 advance(){const r=this.run,m=this.motion,t=m.target;if(!this.active)return;
  const events=m.events.slice(r.eventCursor);r.eventCursor=m.events.length;
  if(events.some(e=>e.type==='forced-stand'))this.settle('protection');
  if(t.hp<=0)this.settle('defeat');
  if(m.feedbackTime-r.started>=S9_COMBO_HELPER.maxSeconds){this.finish('time-limit');return;}
  if(r.phase==='settle'){
   if(!m.action&&((t.hp<=0&&t.state==='down')||(t.state==='standing'&&t.invulnerable===0&&!t.reaction)))this.finish(r.reason);
   return;
  }
  if(r.phase==='attack'&&events.some(e=>e.type==='reference-done')){
   r.completed++;if(r.completed>=S9_COMBO_HELPER.maxCycles){this.settle('cycle-limit');return;}r.phase='approach';
  }
  if(r.phase==='approach'){
   const spacing=t.state==='down'?S9_COMBO_HELPER.downSpacing:S9_COMBO_HELPER.standingSpacing;
   const gap=(t.x-m.x)*m.facing-spacing;
   if(t.present&&gap>.4){const before=m.x;m.move(m.facing*Math.min(gap,S9_COMBO_HELPER.walkSpeed*S9_COMBO_HELPER.step));r.approachDistance+=Math.abs(m.x-before);}
   else{r.cycle++;r.phase='attack';m.replay=true;m.start(0);m.record('combo-demo-cycle',{cycle:r.cycle});}
  }
 }
 tick(seconds){if(!Number.isFinite(seconds)||seconds<0||seconds>5)throw new RangeError('demo tick 0..5');
  if(!this.active){this.motion.tick(seconds);return;}
  this.accumulator+=seconds;while(this.accumulator+1e-10>=S9_COMBO_HELPER.step){this.accumulator=Math.max(0,this.accumulator-S9_COMBO_HELPER.step);this.motion.tick(S9_COMBO_HELPER.step);this.advance();}
 }
}
