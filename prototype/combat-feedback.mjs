/** V10: source-informed contact/reaction structure; no upstream code/assets copied. */
import {CombatRhythm,CUTS} from './combat-rhythm.mjs';
import {feedbackWeapon,feedbackPose} from './feedback-renderer.mjs';
// Closest point on a segment, used for an exact capsule vs rectangle narrow phase.
export function bladeContact(hand,tip,box,radius=5/90){
  const dx=tip.x-hand.x,dy=tip.y-hand.y,len=dx*dx+dy*dy;
  const nearest=(x,y)=>{const t=len?Math.max(0,Math.min(1,((x-hand.x)*dx+(y-hand.y)*dy)/len)):0;return {x:hand.x+t*dx,y:hand.y+t*dy};};
  const clamp=p=>({x:Math.max(box.x0,Math.min(box.x1,p.x)),y:Math.max(box.y0,Math.min(box.y1,p.y))});
  const pairs=[hand,tip].map(p=>({p,q:clamp(p)}));
  for(const x of [box.x0,box.x1])for(const y of [box.y0,box.y1])pairs.push({p:nearest(x,y),q:{x,y}});
  // Slab test catches the segment passing straight through the rectangle.
  let lo=0,hi=1;
  for(const [origin,delta,min,max] of [[hand.x,dx,box.x0,box.x1],[hand.y,dy,box.y0,box.y1]]){
    if(Math.abs(delta)<1e-12){if(origin<min||origin>max){hi=-1;break;}}
    else{const a=(min-origin)/delta,b=(max-origin)/delta;lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));}
  }
  if(lo<=hi&&hi>=0&&lo<=1){const t=(Math.max(0,lo)+Math.min(1,hi))/2;return {x:hand.x+dx*t,y:hand.y+dy*t};}
  pairs.sort((a,b)=>(a.p.x-a.q.x)**2+(a.p.y-a.q.y)**2-((b.p.x-b.q.x)**2+(b.p.y-b.q.y)**2));
  const {p,q}=pairs[0];return (p.x-q.x)**2+(p.y-q.y)**2<=radius*radius?q:null;
}
export class CombatFeedback extends CombatRhythm{
  constructor(options={}){super(options);for(const f of this.fighters){f.reaction=null;f.recovery=null;f.contactPoint=null;}}
  pose(f){return feedbackPose(f);}
  weapon(f){return feedbackWeapon(f);}
  attackBoxes(f){
    const a=f.controller.action,t=this.fighters.find(t=>t!==f);
    if(!a||a.phase!=='active'||f.dead||Math.abs(f.lane-t.lane)>.55)return [];
    const {hand,tip}=this.weapon(f),radius=5/90;
    const point=bladeContact(hand,tip,t.body.enemyBox(),radius);f.contactPoint=point;
    if(!point)return [];
    return [{x0:Math.min(hand.x,tip.x)-radius,x1:Math.max(hand.x,tip.x)+radius,y0:Math.min(hand.y,tip.y)-radius,y1:Math.max(hand.y,tip.y)+radius}];
  }
  resolve(intent){
    const {f,target,a}=intent,before=target.body.state,index=this.events.length,from=this.pose(target);
    super.resolve(intent);
    const e=this.events.slice(index).find(e=>e.type==='damage'||e.type==='guard');if(!e)return;
    const cut=a.cut??0,cfg=a.name==='highSlash'?CUTS[cut]:null;
    const effect=this.effects.at(-1);if(effect&&f.contactPoint){effect.x=f.contactPoint.x;effect.impactY=f.contactPoint.y;effect.direction=f.facing;effect.weight=cfg?cut+1:3;}
    if(e.type!=='damage'||e.armored||target.dead)return;
    target.hurt=0; // Replace V9's one-pose visual timer, without changing physics.
    if(e.protectedStand){target.reaction=null;target.recovery={kind:'protection',age:0,duration:.18};return;}
    target.stun=cfg?cfg.active+cfg.recovery:this.skills[a.name].hitstun;
    const kind=before==='down'?'ground':before==='airborne'?'air':a.name==='launcher'?'launch':['light','reverse','heavy'][cut];
    const duration=Math.max(target.stun,.18);
    // Blend from the actual interrupted pose instead of resetting to idle.
    target.reaction={kind,cut,age:0,duration,direction:f.facing,from};
    e.reaction=kind;e.hitstun=target.stun;this.record('reaction-start',{target:target.id,kind,hitstun:target.stun});
  }
  fixedTick(){
    const prev=this.fighters.map(f=>({state:f.body.state,frozen:f.body.hitstopRemaining>0||f.controller.attackerHitstopRemaining>0,reaction:f.reaction}));
    super.fixedTick();const dt=this.settings.fixedStep;
    this.fighters.forEach((f,i)=>{
      const p=prev[i];
      if(!p.frozen){if(f.reaction===p.reaction&&f.reaction){f.reaction.age+=dt;if(f.reaction.age>=f.reaction.duration)f.reaction=null;}
        if(f.recovery){f.recovery.age+=dt;if(f.recovery.age>=f.recovery.duration)f.recovery=null;}}
      if(p.state==='airborne'&&f.body.state==='down'){f.reaction=null;f.recovery={kind:'landing',age:0,duration:.18};}
      if(p.state==='down'&&f.body.state==='idle'){f.reaction=null;f.recovery={kind:'rise',age:0,duration:.18};}
      if(f.body.state==='invulnerable'){f.reaction=null;f.hurt=0;}
    });
  }
}
