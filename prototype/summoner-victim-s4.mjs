/** S4 standing-victim comparison, original poses and timing.
 * PVE/PK appearance selection is NOT a complete PK rules implementation.
 * No Summoner launch, gravity-adjustment or protection thresholds inferred.
 */
import {SummonerFeedbackS3,SUMMONER_FEEDBACK_CANDIDATE} from './summoner-feedback-s3.mjs';
const S4_IDLE={head:[0,80],shoulder:[0,66],hip:[0,35],backKnee:[-8,19],frontKnee:[8,19],backFoot:[-11,2],frontFoot:[12,2],backElbow:[-12,48],frontElbow:[12,47],backHand:[-14,41],frontHand:[14,41]};
export const S4_HURT_POSES=Object.freeze([
 {head:[7,77],shoulder:[3,64],hip:[.5,34],backKnee:[-10,18],frontKnee:[9,18],backFoot:[-11,2],frontFoot:[12,2],backElbow:[-13,54],frontElbow:[12,49],backHand:[-4,51],frontHand:[5,46]},
 {head:[9,83],shoulder:[4,69],hip:[0,35],backKnee:[-10,17],frontKnee:[10,18],backFoot:[-11,2],frontFoot:[12,2],backElbow:[-12,59],frontElbow:[15,59],backHand:[-3,67],frontHand:[3,63]},
 {head:[12,70],shoulder:[7,57],hip:[1.5,31],backKnee:[-12,15],frontKnee:[11,14],backFoot:[-13,2],frontFoot:[14,2],backElbow:[-7,57],frontElbow:[17,49],backHand:[2,60],frontHand:[8,47]}
]);
const s4VictimSmooth=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u);};
const s4VictimEaseOut=u=>1-(1-Math.max(0,Math.min(1,u)))**3;
const s4VictimPoints=(p,d=1)=>Object.fromEntries(Object.entries(p).map(([k,v])=>[k,{x:v[0]*d,y:v[1]}]));
const s4VictimBlend=(a,b,u)=>Object.fromEntries(Object.keys(a).map(k=>[k,{x:a[k].x+(b[k].x-a[k].x)*u,y:a[k].y+(b[k].y-a[k].y)*u}]));
export class SummonerVictimS4 extends SummonerFeedbackS3{
 reset(){super.reset();this.targetKind=this.targetKind??'monster';this.recoilCurve=null;}
 setTargetKind(kind){if(!['monster','player'].includes(kind))throw new RangeError('target kind');this.targetKind=kind;}
 setFeedbackEnabled(on){super.setFeedbackEnabled(on);if(!on)this.recoilCurve=null;}
 targetPose(){const t=this.target,r=t.reaction;let local=s4VictimPoints(S4_IDLE,this.facing),phase='idle';
  if(r?.from){const peak=s4VictimPoints(S4_HURT_POSES[r.stage],r.direction);
   if(r.age<.033333333333){local=s4VictimBlend(r.from,peak,s4VictimSmooth(r.age/(4/120)));phase='impact';}
   else if(r.age<r.hitstun){local=peak;phase='hold';}
   else{local=s4VictimBlend(peak,s4VictimPoints(S4_IDLE,this.facing),s4VictimSmooth((r.age-r.hitstun)/.12));phase='recover';}
  }
  const world=Object.fromEntries(Object.entries(local).map(([k,v])=>[k,{x:t.x+v.x,y:v.y}]));
  return {x:t.x,lean:world.head.x-t.x,compress:80-world.head.y,phase,...world};
 }
 impact(point){const before=this.targetPose(),from={};
  for(const k of Object.keys(S4_IDLE))from[k]={x:before[k].x-this.target.x,y:before[k].y};
  const e=super.impact(point);e.targetKind=this.targetKind;
  if(this.feedbackEnabled){const c=SUMMONER_FEEDBACK_CANDIDATE.stages[e.stage];
   this.target.reaction={stage:e.stage,age:0,hitstun:c.stun,duration:c.stun+.12,direction:this.facing,from};
   this.target.pushRemaining=0;this.recoilCurve={age:0,duration:.14,distance:c.push,direction:this.facing};
   this.record('victim-reaction-start',{targetKind:this.targetKind,stage:e.stage,fromPhase:before.phase});
  }return e;
 }
 fixedTick(){if(this.paused)return;const curve=this.recoilCurve,frozen=this.target.stop>1e-8;
  super.fixedTick();if(curve&&this.recoilCurve===curve&&!frozen){
   const before=s4VictimEaseOut(curve.age/curve.duration);curve.age=Math.min(curve.duration,curve.age+1/120);
   this.target.x+=(s4VictimEaseOut(curve.age/curve.duration)-before)*curve.distance*curve.direction;
   if(curve.age+1e-8>=curve.duration)this.recoilCurve=null;
  }
 }
 snapshot(){return {...super.snapshot(),targetKind:this.targetKind,recoilCurve:this.recoilCurve&&{...this.recoilCurve},comparisonScope:'Original standing reaction for monster/player comparison; DNF air/down/PK protection NOT COVERED'};}
}
