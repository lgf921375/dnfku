/** S7 visible-contact experiment on S6. Old rectangular behavior is selectable.
 * Numeric damage/motion/PK candidates stay unchanged. Body capsules and the
 * projection guard are original prototype choices, NOT proven DNF rules.
 */
import {SummonerVictimS6} from './summoner-victim-s6.mjs';
import {SUMMONER_FEEDBACK_CANDIDATE} from './summoner-feedback-s3.mjs';
import {summonerCapsuleContactS7} from './summoner-contact-s7.mjs';
export class SummonerVictimS7 extends SummonerVictimS6{
 reset(){super.reset();this.legacyContact??=true;this.pendingContact=null;this.contactEdge=null;}
 start(stage){this.pendingContact=null;return super.start(stage);}
 setLegacyContact(on){this.legacyContact=!!on;this.pendingContact=null;}
 targetCapsules(){const p=this.targetPose(),pt=k=>({x:p[k].x,y:p[k].y-this.target.lane});
  return [
   {part:'head',a:pt('head'),b:pt('head'),radius:8},
   {part:'body',a:pt('shoulder'),b:pt('hip'),radius:7},
   {part:'legs',a:pt('hip'),b:pt('backKnee'),radius:5},
   {part:'legs',a:pt('backKnee'),b:pt('backFoot'),radius:4},
   {part:'legs',a:pt('hip'),b:pt('frontKnee'),radius:5},
   {part:'legs',a:pt('frontKnee'),b:pt('frontFoot'),radius:4}
  ];
 }
 targetBoxes(){if(this.legacyContact)return super.targetBoxes().map(b=>({...b,y0:b.y0-this.target.lane,y1:b.y1-this.target.lane}));return this.targetCapsules().map(c=>({x0:Math.min(c.a.x,c.b.x)-c.radius,x1:Math.max(c.a.x,c.b.x)+c.radius,y0:Math.min(c.a.y,c.b.y)-c.radius,y1:Math.max(c.a.y,c.b.y)+c.radius}));}
 activeContact(){this.pendingContact=null;if(this.legacyContact){const p=super.activeContact();return p&&{x:p.x,y:p.y+this.target.lane};}const a=this.action,t=this.target,c=a&&SUMMONER_FEEDBACK_CANDIDATE.stages[a.stage];
  if(!a||a.hitTarget||!t.present||t.hp<=0||t.invulnerable>1e-8||Math.abs(t.lane)>SUMMONER_FEEDBACK_CANDIDATE.laneTolerance||a.frame+1e-8<c.from||a.frame>=c.to-1e-8||(t.x-this.x)*this.facing<=0)return null;
  const w=this.staff(),hits=this.targetCapsules().map((shape,index)=>{const hit=summonerCapsuleContactS7(w.butt,w.tip,shape.a,shape.b,shape.radius);return hit&&{...hit,part:shape.part,index};}).filter(Boolean).sort((a,b)=>a.t-b.t||a.index-b.index);
  if(!hits.length)return null;this.pendingContact=hits[0];return {x:hits[0].point.x,y:hits[0].point.y+t.lane};
 }
 impact(point){const contact=this.pendingContact,legacy=this.legacyContact,e=super.impact(point);if(!e)return e;
  e.contactModel=legacy?'S6 rectangle + S7 projection':'S7 body capsule candidate';e.lane=this.target.lane;e.projectedPoint={x:point.x,y:point.y-this.target.lane};
  if(contact)e.contact={part:contact.part,t:contact.t,point:{...contact.point},staffPoint:{...contact.staffPoint}};
  const fx=this.effects.find(x=>x.attackId===e.attackId);if(fx)fx.lane=this.target.lane;return e;
 }
 playContactEdge(){this.scenario='standing';this.fragile=false;this.reset();this.target.x=this.x+this.facing*60;this.start(1);this.action.frame=11;this.paused=true;
  const before=this.targetPose(),staff=this.staff(),point=this.activeContact();this.contactEdge={before,staff,point,legacy:this.legacyContact,scope:'Public paused geometric fixture; not a complete normal second attack or original DNF footage'};
  if(point)this.impact(point);this.record('contact-edge-demo',{hit:!!point,legacy:this.legacyContact});
 }
 snapshot(){return {...super.snapshot(),legacyContact:this.legacyContact,contactEdge:this.contactEdge,contactModel:this.legacyContact?'S6 rectangle + S7 projection':'S7 original body capsule candidate; exact DNF hurtboxes NOT COVERED'};}
}
