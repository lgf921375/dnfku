/** Original S3 feedback experiment on the S2 owner rig.
 * Contact/dedup/freeze ordering is source-informed. Every numeric combat value
 * below is an ORIGINAL candidate, not measured DNF Summoner combat data.
 */
import {SummonerMotionS2} from './summoner-motion-s2.mjs';

export const SUMMONER_FEEDBACK_CANDIDATE=Object.freeze({
  fixedStep:1/120,staffRadius:2.1,laneTolerance:9,targetOffset:45,targetHP:120,
  stages:Object.freeze([
    Object.freeze({from:4,to:6,stopTicks:5,stun:.18,push:3,damage:8}),
    Object.freeze({from:11,to:14,stopTicks:5,stun:.22,push:4,damage:10}),
    Object.freeze({from:20,to:23,stopTicks:8,stun:.28,push:8,damage:14})
  ]),
  status:'ORIGINAL CANDIDATE: active frames, damage, stop, recoil and sound are not official DNF values; DNF parity NOT COVERED'
});

// Segment/capsule narrow phase: a bounding rectangle alone must not hit its
// empty diagonal corners. Original geometric implementation, independent of swords.
export function summonerStaffContact(a,b,box,radius=2.1){
  const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;
  const clamp=p=>({x:Math.max(box.x0,Math.min(box.x1,p.x)),y:Math.max(box.y0,Math.min(box.y1,p.y))});
  const near=(x,y)=>{const t=len?Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/len)):0;return {x:a.x+t*dx,y:a.y+t*dy};};
  let lo=0,hi=1;
  for(const [o,d,min,max] of [[a.x,dx,box.x0,box.x1],[a.y,dy,box.y0,box.y1]]){
    if(Math.abs(d)<1e-12){if(o<min||o>max){hi=-1;break;}}
    else{const u=(min-o)/d,v=(max-o)/d;lo=Math.max(lo,Math.min(u,v));hi=Math.min(hi,Math.max(u,v));}
  }
  if(lo<=hi&&hi>=0&&lo<=1){const t=(Math.max(0,lo)+Math.min(1,hi))/2;return {x:a.x+t*dx,y:a.y+t*dy};}
  const pairs=[a,b].map(p=>({p,q:clamp(p)}));
  for(const x of [box.x0,box.x1])for(const y of [box.y0,box.y1])pairs.push({p:near(x,y),q:{x,y}});
  const distance=o=>(o.p.x-o.q.x)**2+(o.p.y-o.q.y)**2;
  pairs.sort((u,v)=>distance(u)-distance(v));return distance(pairs[0])<=radius*radius?pairs[0].q:null;
}

export class SummonerFeedbackS3 extends SummonerMotionS2{
  constructor(options={}){super();this.feedbackOptions={enabled:options.enabled??true};this.reset();}
  reset(){super.reset();this.feedbackTime=0;this.attackerStop=0;this.nextAttackId=0;this.effects=[];this.hitCount=0;
    this.feedbackEnabled=this.feedbackOptions?.enabled??true;
    this.target={x:45,lane:0,present:true,hp:120,stop:0,stun:0,reaction:null,pushRemaining:0,pushSpeed:0};}
  start(stage){const e=super.start(stage);this.action.attackId=++this.nextAttackId;this.action.hitTarget=false;return e;}
  setFeedbackEnabled(on){this.feedbackEnabled=!!on;this.feedbackOptions.enabled=this.feedbackEnabled;
    if(!on){this.attackerStop=0;this.effects=[];this.target.stop=0;this.target.stun=0;this.target.reaction=null;this.target.pushRemaining=0;}}
  placeTargetInFront(){this.target.x=this.x+this.facing*SUMMONER_FEEDBACK_CANDIDATE.targetOffset;this.target.pushRemaining=0;}
  targetPose(){const t=this.target,r=t.reaction;let lean=0,compress=0;
    if(r){const u=Math.min(1,r.age/r.duration),envelope=(.4+.6*Math.sin(Math.min(1,u/.22)*Math.PI/2))*(1-u);
      lean=r.direction*([4,7,11][r.stage]*envelope+r.fromLean*(1-u));compress=[1,2,5][r.stage]*envelope;}
    return {x:t.x,lean,compress,head:{x:t.x+lean,y:80-compress},shoulder:{x:t.x+lean*.65,y:66-compress},hip:{x:t.x+lean*.12,y:35-compress*.25}};
  }
  targetBoxes(){const p=this.targetPose();return [
    {x0:p.head.x-8,x1:p.head.x+8,y0:p.head.y-9,y1:p.head.y+9},
    {x0:Math.min(p.shoulder.x,p.hip.x)-10,x1:Math.max(p.shoulder.x,p.hip.x)+10,y0:p.hip.y,y1:p.shoulder.y+2},
    {x0:p.x-11,x1:p.x+11,y0:8,y1:p.hip.y}
  ];}
  activeContact(){const a=this.action,t=this.target;
    if(!a||a.hitTarget||!t.present||t.hp<=0||Math.abs(t.lane)>SUMMONER_FEEDBACK_CANDIDATE.laneTolerance)return null;
    const c=SUMMONER_FEEDBACK_CANDIDATE.stages[a.stage];
    if(a.frame+1e-8<c.from||a.frame>=c.to-1e-8||(t.x-this.x)*this.facing<=0)return null;
    const staff=this.staff();for(const box of this.targetBoxes()){
      const p=summonerStaffContact(staff.butt,staff.tip,box,SUMMONER_FEEDBACK_CANDIDATE.staffRadius);if(p)return p;
    }return null;
  }
  impact(point){const a=this.action,t=this.target,c=SUMMONER_FEEDBACK_CANDIDATE.stages[a.stage];a.hitTarget=true;
    t.hp=Math.max(0,t.hp-c.damage);this.hitCount++;
    const stop=this.feedbackEnabled?c.stopTicks/120:0;
    if(this.feedbackEnabled){const fromLean=this.targetPose().lean*this.facing;
      this.attackerStop=stop;t.stop=stop;t.stun=c.stun;t.reaction={stage:a.stage,age:0,duration:c.stun,direction:this.facing,fromLean};
      t.pushRemaining=c.push;t.pushSpeed=this.facing*c.push/.14;
      this.effects.push({x:point.x,y:point.y,age:0,stage:a.stage,direction:this.facing,attackId:a.attackId});}
    return this.record('impact',{wall:+this.feedbackTime.toFixed(6),stage:a.stage,attackId:a.attackId,point:{...point},damage:c.damage,targetHP:t.hp,stopSeconds:stop,feedbackEnabled:this.feedbackEnabled});
  }
  fixedTick(){if(this.paused)return;const dt=1/120;this.feedbackTime+=dt;
    const ownerFrozen=this.attackerStop>1e-8,victimFrozen=this.target.stop>1e-8;
    this.attackerStop=Math.max(0,this.attackerStop-dt);this.target.stop=Math.max(0,this.target.stop-dt);
    for(const e of this.effects)e.age+=dt;this.effects=this.effects.filter(e=>e.age<.24);
    if(!victimFrozen){const t=this.target;t.stun=Math.max(0,t.stun-dt);
      if(t.reaction){t.reaction.age+=dt;if(t.reaction.age+1e-8>=t.reaction.duration)t.reaction=null;}
      if(t.pushRemaining>0){const dx=Math.min(t.pushRemaining,Math.abs(t.pushSpeed)*dt);t.x+=Math.sign(t.pushSpeed)*dx;t.pushRemaining-=dx;}
    }
    if(!ownerFrozen){super.fixedTick();const point=this.activeContact();if(point)this.impact(point);}
  }
  snapshot(){return {...super.snapshot(),feedbackTime:this.feedbackTime,attackerStop:this.attackerStop,target:{...this.target,reaction:this.target.reaction&&{...this.target.reaction}},targetPose:this.targetPose(),hitCount:this.hitCount,effects:this.effects.map(e=>({...e})),combatStatus:SUMMONER_FEEDBACK_CANDIDATE.status};}
}
