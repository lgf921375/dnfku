/** S5 original victim model. Corrects freeze-before-hurt ordering.
 * State structure is source-informed; poses/physics/PK thresholds are ORIGINAL
 * candidates, not official DNF values. Owner basic attacks never launch a
 * grounded target. Air/down scenes are explicitly pre-positioned test fixtures.
 */
import {SummonerMotionS2} from './summoner-motion-s2.mjs';
import {SummonerFeedbackS3,SUMMONER_FEEDBACK_CANDIDATE} from './summoner-feedback-s3.mjs';

export const S5_VICTIM_CONFIG=Object.freeze({gravity:520,airHitVelocity:85,
 downSeconds:1.3,riseSeconds:.22,landingSeconds:.10,recoverSeconds:.10,
 protectionSeconds:.55,comboResetSeconds:.65,
 pkThresholds:Object.freeze({standing:48,air:42,down:22}),
 status:'Original victim/PK candidates; exact DNF Summoner victim poses, launch properties and protection values NOT COVERED'});
const S5_NEUTRAL={head:[0,80],shoulder:[0,66],hip:[0,35],backKnee:[-8,19],frontKnee:[8,19],backFoot:[-11,2],frontFoot:[12,2],backElbow:[-12,48],frontElbow:[12,47],backHand:[-14,41],frontHand:[14,41]};
// Contact height chooses the hurt silhouette; attack stage only scales force.
const S5_HURT={
 head:{head:[9,77],shoulder:[4,64],hip:[0,34],backKnee:[-10,17],frontKnee:[9,18],backFoot:[-11,2],frontFoot:[12,2],backElbow:[-12,58],frontElbow:[14,57],backHand:[-4,65],frontHand:[4,62]},
 body:{head:[8,74],shoulder:[6,58],hip:[1,33],backKnee:[-11,16],frontKnee:[10,16],backFoot:[-11,2],frontFoot:[12,2],backElbow:[-11,52],frontElbow:[13,49],backHand:[-2,49],frontHand:[4,45]},
 legs:{head:[4,77],shoulder:[1,63],hip:[-2,32],backKnee:[-13,16],frontKnee:[11,13],backFoot:[-12,2],frontFoot:[13,2],backElbow:[-13,51],frontElbow:[12,50],backHand:[-10,48],frontHand:[6,44]}
};
const S5_DOWN={head:[-24,13],shoulder:[-12,14],hip:[10,12],backKnee:[24,9],frontKnee:[22,16],backFoot:[39,5],frontFoot:[37,7],backElbow:[-6,23],frontElbow:[-10,7],backHand:[-17,25],frontHand:[-19,8]};
const s5Clamp=u=>Math.max(0,Math.min(1,u));
const s5Smooth=u=>{u=s5Clamp(u);return u*u*(3-2*u);};
const s5Points=(p,d=1)=>Object.fromEntries(Object.entries(p).map(([k,v])=>[k,{x:v[0]*d,y:v[1]}]));
const s5Blend=(a,b,u)=>Object.fromEntries(Object.keys(S5_NEUTRAL).map(k=>[k,{x:a[k].x+(b[k].x-a[k].x)*u,y:a[k].y+(b[k].y-a[k].y)*u}]));

export class SummonerVictimS5 extends SummonerFeedbackS3{
 reset(){super.reset();this.targetKind??='monster';this.scenario??='standing';this.armored??=false;this.pkProtectionEnabled??=false;
  Object.assign(this.target,{state:'standing',y:0,vy:0,facing:-this.facing,direction:this.facing,stateAge:0,transition:null,invulnerable:0,combo:{standing:0,air:0,down:0},quiet:0});
  this.recoilCurve=null;
  if(this.scenario==='air'){this.target.state='air';this.target.y=12;this.target.vy=60;}
  if(this.scenario==='down'){this.target.state='down';this.target.x=this.x+this.facing*32;}
 }
 setTargetKind(kind){if(!['monster','player'].includes(kind))throw new RangeError('target kind');this.targetKind=kind;this.clearCombo();}
 setScenario(scene){if(!['standing','air','down'].includes(scene))throw new RangeError('victim scene');this.scenario=scene;this.reset();}
 setArmored(on){this.armored=!!on;if(on){this.target.reaction=null;this.target.stun=0;this.recoilCurve=null;}}
 setPKProtection(on){this.pkProtectionEnabled=!!on;this.clearCombo();}
 clearCombo(){if(this.target)this.target.combo={standing:0,air:0,down:0};}
 setFeedbackEnabled(on){super.setFeedbackEnabled(on);if(!on)this.recoilCurve=null;}
 placeTargetInFront(){super.placeTargetInFront();this.target.direction=this.facing;this.target.facing=-this.facing;this.recoilCurve=null;
  if(this.scenario==='down')this.target.x=this.x+this.facing*32;
 }
 localPose(){const t=this.target,d=t.direction,neutral=s5Points(S5_NEUTRAL,d);let local=neutral,phase='idle';
  if(t.state==='air'){
   const base=s5Points(S5_HURT.body,d),angle=d*(.35+.55*s5Clamp(-t.vy/230)),c=Math.cos(angle),s=Math.sin(angle);
   local=Object.fromEntries(Object.entries(base).map(([k,p])=>[k,{x:p.x*c+(p.y-35)*s,y:35+(p.y-35)*c-p.x*s}]));
   const min=Math.min(...Object.values(local).map(p=>p.y));for(const p of Object.values(local))p.y+=2-min;phase=t.vy>0?'air-rise':'air-fall';
  }else if(t.state==='down'){local=s5Points(S5_DOWN,d);phase='down';}
  else if(t.state==='rise'){local=s5Blend(t.transition.from,neutral,s5Smooth(t.stateAge/S5_VICTIM_CONFIG.riseSeconds));phase='rise';}
  if(t.transition&&t.state==='down'&&t.stateAge<S5_VICTIM_CONFIG.landingSeconds){local=s5Blend(t.transition.from,local,s5Smooth(t.stateAge/S5_VICTIM_CONFIG.landingSeconds));phase='landing';}
  const r=t.reaction;
  if(r&&t.state!=='rise'){
   if(r.age<r.hitstun){local=r.peak;phase=t.state==='air'?'air-hit':t.state==='down'?'down-hit':r.age<4/120?'impact':'hold';}
   else {local=s5Blend(r.peak,local,s5Smooth((r.age-r.hitstun)/S5_VICTIM_CONFIG.recoverSeconds));phase=t.state==='standing'?'recover':phase;}
  }
  return {local,phase};
 }
 targetPose(){const t=this.target,{local,phase}=this.localPose(),world=Object.fromEntries(Object.entries(local).map(([k,v])=>[k,{x:t.x+v.x,y:t.y+v.y}]));
  return {x:t.x,y:t.y,lean:world.head.x-t.x,compress:80-(world.head.y-t.y),phase,state:t.state,...world};
 }
 targetBoxes(){const p=this.targetPose(),box=(names,r)=>{const pts=names.map(k=>p[k]);return {x0:Math.min(...pts.map(q=>q.x))-r,x1:Math.max(...pts.map(q=>q.x))+r,y0:Math.min(...pts.map(q=>q.y))-r,y1:Math.max(...pts.map(q=>q.y))+r};};
  // Small articulated boxes rotate/flatten with the visible body. No tall idle
  // box remains above a downed victim, and airborne boxes retain their height.
  return [box(['head'],8),box(['shoulder','hip'],7),box(['hip','backKnee'],5),box(['backKnee','backFoot'],4),box(['hip','frontKnee'],5),box(['frontKnee','frontFoot'],4)];
 }
 activeContact(){return this.target.invulnerable>1e-8?null:super.activeContact();}
 impact(point){if(this.target.invulnerable>1e-8||!this.action||this.action.hitTarget)return null;
  const t=this.target,before=this.targetPose(),state=t.state,from=Object.fromEntries(Object.keys(S5_NEUTRAL).map(k=>[k,{x:before[k].x-t.x,y:before[k].y-t.y}]));
  const region=Math.abs(point.y-before.head.y)<=10?'head':point.y<before.hip.y+8?'legs':'body';
  const e=super.impact(point),c=SUMMONER_FEEDBACK_CANDIDATE.stages[e.stage];t.facing=-this.facing;t.direction=this.facing;t.quiet=0;
  Object.assign(e,{targetKind:this.targetKind,victimState:state,region,armored:this.armored});t.pushRemaining=0;
  if(t.hp<=0){t.reaction=null;this.land('defeat',s5Points(S5_HURT[region],this.facing));this.recoilCurve=null;return e;}
  if(!this.feedbackEnabled)return e;
  if(this.armored){t.reaction=null;t.stun=0;this.recoilCurve=null;this.record('armored-hit',{stage:e.stage,damage:e.damage});return e;}
  let desired;
  if(state==='down'){desired=s5Points(S5_DOWN,t.direction);desired.head.y+=3;desired.shoulder.y+=2;desired.frontHand.y+=4;t.stateAge=0;t.transition=null;}
  else if(state==='air'){desired=from;desired=s5Blend(desired,s5Points(S5_HURT.body,t.direction),.25);t.vy=Math.max(S5_VICTIM_CONFIG.airHitVelocity,t.vy);}
  else {desired=s5Points(S5_HURT[region],t.direction);const strength=[.85,1,1.15][e.stage];for(const k of Object.keys(desired)){desired[k].x*=strength;} // planted feet keep their original contact points
   desired.backFoot=from.backFoot;desired.frontFoot=from.frontFoot;
  }
  // The hurt silhouette is selected BEFORE hitstop. Re-hits start from the
  // current body, without a neutral-pose reset. This is a discrete animation
  // change at confirmed impact, not a delayed tween after the frozen interval.
  const peak=s5Blend(from,desired,state==='standing'? .85:1);
  t.reaction={stage:e.stage,region,age:0,hitstun:c.stun,duration:c.stun+S5_VICTIM_CONFIG.recoverSeconds,peak,from};
  this.recoilCurve={age:0,duration:.14,distance:state==='down'?c.push*.3:c.push,direction:this.facing};
  this.record('victim-reaction-start',{stage:e.stage,region,state,fromPhase:before.phase,poseReadyBeforeStop:true});
  if(this.targetKind==='player'&&this.pkProtectionEnabled){
   const key=state==='air'?'air':state==='down'?'down':'standing';t.combo[key]+=e.damage;
   if(t.combo.down>=S5_VICTIM_CONFIG.pkThresholds.down)this.beginRise(true);
   else if(t.combo.standing>=S5_VICTIM_CONFIG.pkThresholds.standing)this.land('standing-protection');
  }
  return e;
 }
 land(reason='floor',fromPose=null){const t=this.target,from=fromPose??this.localPose().local;t.y=0;t.vy=0;t.state='down';t.stateAge=0;t.transition={from};t.reaction=null;t.stun=0;
  this.record('victim-land',{reason});
 }
 beginRise(protectedRise=false){const t=this.target,from=this.localPose().local;t.y=0;t.vy=0;t.state='rise';t.stateAge=0;t.transition={from};t.reaction=null;t.stun=0;this.recoilCurve=null;
  if(protectedRise){t.invulnerable=S5_VICTIM_CONFIG.protectionSeconds;this.clearCombo();this.record('forced-stand',{candidate:true,invulnerable:t.invulnerable});}
  else this.record('victim-rise',{});
 }
 fixedTick(){if(this.paused)return;const dt=1/120,t=this.target,ownerFrozen=this.attackerStop>1e-8,victimFrozen=t.stop>1e-8;
  this.feedbackTime+=dt;this.attackerStop=Math.max(0,this.attackerStop-dt);t.stop=Math.max(0,t.stop-dt);
  for(const e of this.effects)e.age+=dt;this.effects=this.effects.filter(e=>e.age<.24);
  if(!victimFrozen){t.stun=Math.max(0,t.stun-dt);t.invulnerable=Math.max(0,t.invulnerable-dt);t.stateAge+=dt;t.quiet+=dt;
   if(t.reaction){t.reaction.age+=dt;if(t.reaction.age+1e-8>=t.reaction.duration)t.reaction=null;}
   const curve=this.recoilCurve;if(curve){const ease=u=>1-(1-s5Clamp(u))**3,before=ease(curve.age/curve.duration);curve.age=Math.min(curve.duration,curve.age+dt);t.x+=(ease(curve.age/curve.duration)-before)*curve.distance*curve.direction;if(curve.age+1e-8>=curve.duration)this.recoilCurve=null;}
   if(t.state==='air'){const adjustment=this.targetKind==='player'&&this.pkProtectionEnabled?1+1.25*s5Clamp(t.combo.air/S5_VICTIM_CONFIG.pkThresholds.air):1;
    t.vy-=S5_VICTIM_CONFIG.gravity*adjustment*dt;t.y+=t.vy*dt;if(t.y<=0)this.land();
   }else if(t.state==='down'&&t.hp>0&&t.stun===0&&t.stateAge>=S5_VICTIM_CONFIG.downSeconds)this.beginRise();
   else if(t.state==='rise'&&t.stateAge+1e-8>=S5_VICTIM_CONFIG.riseSeconds){t.state='standing';t.stateAge=0;t.transition=null;this.record('victim-standing',{});}
   if(t.state==='standing'&&!t.reaction&&t.quiet>=S5_VICTIM_CONFIG.comboResetSeconds)this.clearCombo();
  }
  if(!ownerFrozen){SummonerMotionS2.prototype.fixedTick.call(this);const point=this.activeContact();if(point)this.impact(point);}
 }
 snapshot(){return {...super.snapshot(),targetKind:this.targetKind,scenario:this.scenario,armored:this.armored,pkProtectionEnabled:this.pkProtectionEnabled,recoilCurve:this.recoilCurve&&{...this.recoilCurve},comparisonScope:S5_VICTIM_CONFIG.status};}
}
