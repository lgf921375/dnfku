/** Original Canvas illustration. The owner motion rig does not reuse sword poses. */
import {summonerStaff} from './summoner-motion.mjs';
export function drawSummoner(ctx,motion,{width=960,height=540,rig=false}={}){
  ctx.save();ctx.scale(width/960,height/540);
  const bg=ctx.createLinearGradient(0,0,0,540);bg.addColorStop(0,'#171a2d');bg.addColorStop(1,'#28213b');ctx.fillStyle=bg;ctx.fillRect(0,0,960,540);
  for(let i=0;i<6;i++){const x=i*190-10;ctx.fillStyle='#242840';ctx.fillRect(x,60,32,260);ctx.fillStyle='#35374d';ctx.fillRect(x-6,312,44,8);ctx.strokeStyle='#343b58';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x+98,156,66,Math.PI,0);ctx.stroke();}
  ctx.fillStyle='#39333b';ctx.fillRect(0,322,960,218);ctx.strokeStyle='#62534855';ctx.lineWidth=1;
  for(let y=340;y<541;y+=28){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}
  for(let i=-3;i<12;i++){ctx.beginPath();ctx.moveTo(i*120,322);ctx.lineTo(i*160-120,540);ctx.stroke();}
  const cx=470+motion.x,floor=402,scale=2.45;
  ctx.fillStyle='#0f1321aa';ctx.beginPath();ctx.ellipse(cx,floor+3,57,11,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#a797e24d';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(cx,floor+3,84,19,0,0,Math.PI*2);ctx.stroke();
  const p=motion.pose(),w=summonerStaff(p),pt=([x,y])=>[cx+x*scale*motion.facing,floor-y*scale];
  const line=(a,b,color,width)=>{ctx.strokeStyle=color;ctx.lineWidth=width*scale;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(...pt(a));ctx.lineTo(...pt(b));ctx.stroke();};
  const poly=(points,color)=>{ctx.fillStyle=color;ctx.strokeStyle='#151627';ctx.lineWidth=scale*.7;ctx.beginPath();points.forEach((v,i)=>i?ctx.lineTo(...pt(v)):ctx.moveTo(...pt(v)));ctx.closePath();ctx.fill();ctx.stroke();};
  const ellipse=(v,rx,ry,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(...pt(v),rx*scale,ry*scale,0,0,Math.PI*2);ctx.fill();};
  const h=p.hip,s=p.shoulder,head=p.head;
  line(h,p.backKnee,'#29263d',7);line(p.backKnee,p.backFoot,'#191d31',6);line(p.backFoot,[p.backFoot[0]+6,p.backFoot[1]],'#111626',6);
  const elbow=[s[0]-6,s[1]-10];line([s[0]-5,s[1]-3],elbow,'#563f73',6);line(elbow,p.freeHand,'#f0c5b0',4);
  // Staff is drawn from exactly the public rig geometry, both orientations.
  line([w.butt.x,w.butt.y],[w.tip.x,w.tip.y],'#342731',3.4);
  line([w.butt.x,w.butt.y],[w.tip.x,w.tip.y],'#c5a46f',1.5);
  ellipse([w.tip.x,w.tip.y],3.5,4.5,'#a680e1');ellipse([w.tip.x,w.tip.y],1.6,2.7,'#f2dcff');
  const coatLean=(s[0]-h[0])*.6;
  poly([[s[0]-7,s[1]],[s[0]+5,s[1]-2],[h[0]+8,h[1]+1],[h[0]+15-coatLean,h[1]-13],[h[0]-16-coatLean,h[1]-11],[h[0]-7,h[1]+2]],'#332541');
  poly([[s[0]-6,s[1]],[s[0]+5,s[1]-2],[h[0]+6,h[1]+3],[h[0]-6,h[1]+3]],'#73538f');
  poly([[h[0]-9,h[1]+3],[h[0]+8,h[1]+3],[h[0]+8,h[1]-1],[h[0]-9,h[1]-1]],'#d4b372');
  line([s[0]+1,s[1]+4],[head[0],head[1]-5],'#f0c5b0',5);
  ellipse([head[0]-1,head[1]+1],9,12,'#684655');
  poly([[head[0]-9,head[1]+5],[head[0]-14,head[1]-7],[head[0]-8,head[1]-13],[head[0]-5,head[1]+1]],'#684655');
  poly([[head[0]-4,head[1]+7],[head[0]+5,head[1]+7],[head[0]+7,head[1]+1],[head[0]+10,head[1]-2],[head[0]+6,head[1]-3],[head[0]+5,head[1]-8],[head[0]-2,head[1]-7],[head[0]-5,head[1]-1]],'#f0c5b0');
  poly([[head[0]-8,head[1]+4],[head[0]-4,head[1]+12],[head[0]+5,head[1]+11],[head[0]+9,head[1]+6],[head[0]+3,head[1]+5],[head[0],head[1]+8],[head[0]-3,head[1]+1]],'#b17a81');
  line([head[0]+3,head[1]-1],[head[0]+6,head[1]-1],'#29263d',.8);
  ellipse([head[0]-6,head[1]+6],2.2,2.2,'#e5d398');
  const armElbow=[(s[0]+p.hand[0])/2+3,(s[1]+p.hand[1])/2-5];
  line([s[0]+5,s[1]-2],armElbow,'#76538e',6);line(armElbow,p.hand,'#f0c5b0',4);ellipse(p.hand,2.8,2.8,'#f4ccb4');
  line(h,p.frontKnee,'#544461',7);line(p.frontKnee,p.frontFoot,'#232238',6);line(p.frontFoot,[p.frontFoot[0]+7,p.frontFoot[1]],'#13192b',6);
  if(rig){line([w.butt.x,w.butt.y],[w.tip.x,w.tip.y],'#6cf5d6aa',4);for(const k of ['hip','shoulder','head','hand','frontKnee','backKnee'])ellipse(p[k],1.4,1.4,'#ffe39b');}
  ctx.fillStyle='#e9ddf6';ctx.font='600 24px sans-serif';ctx.fillText('SUMMONER / OWNER BASIC',34,46);
  ctx.font='13px sans-serif';ctx.fillStyle='#b6aac7';ctx.fillText('Motion candidate · empty swing reference · original illustration',34,71);
  const frame=motion.preview??motion.action?.frame??30;
  ctx.fillStyle='#d9c3ff';ctx.font='16px monospace';ctx.fillText(`POSE ${String(Math.floor(frame)).padStart(2,'0')} / 30`,34,110);
  ctx.fillStyle='#b6aac7';ctx.font='13px sans-serif';ctx.fillText('No target-hit / launch / damage parity claimed',34,515);
  const ends=[10,18,30],colors=['#c7a1ff','#a290e4','#e4b48b'];let begin=0;
  for(let i=0;i<3;i++){ctx.fillStyle=colors[i];ctx.globalAlpha=motion.action?.stage===i?1:.35;ctx.fillRect(630+begin*9,94,(ends[i]-begin)*9-2,7);ctx.globalAlpha=1;begin=ends[i];}
  ctx.fillStyle='#f5edf9';ctx.fillRect(630+frame*9,88,2,19);ctx.restore();
}
