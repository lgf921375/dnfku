/** Original Canvas illustration. The owner motion rig does not reuse sword poses. */
import {summonerStaff} from './summoner-motion.mjs';
export function drawSummonerVictimS4(ctx,motion,{width=960,height=540,rig=false}={}){
  ctx.save();ctx.scale(width/960,height/540);
  const latest=motion.effects?.at(-1);if(latest&&latest.age<.08)ctx.translate(Math.sin(latest.age*110)*[1.2,1.6,2.8][latest.stage]*(1-latest.age/.08),0);
  const bg=ctx.createLinearGradient(0,0,0,540);bg.addColorStop(0,'#171a2d');bg.addColorStop(1,'#28213b');ctx.fillStyle=bg;ctx.fillRect(0,0,960,540);
  for(let i=0;i<6;i++){const x=i*190-10;ctx.fillStyle='#242840';ctx.fillRect(x,60,32,260);ctx.fillStyle='#35374d';ctx.fillRect(x-6,312,44,8);ctx.strokeStyle='#343b58';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x+98,156,66,Math.PI,0);ctx.stroke();}
  ctx.fillStyle='#39333b';ctx.fillRect(0,322,960,218);ctx.strokeStyle='#62534855';ctx.lineWidth=1;
  for(let y=340;y<541;y+=28){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}
  for(let i=-3;i<12;i++){ctx.beginPath();ctx.moveTo(i*120,322);ctx.lineTo(i*160-120,540);ctx.stroke();}
  drawSummonerTargetS4(ctx,motion,rig);
  const cx=470+motion.x,floor=402,scale=2.45;
  ctx.fillStyle='#0f1321aa';ctx.beginPath();ctx.ellipse(cx,floor+3,57,11,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#a797e24d';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(cx,floor+3,84,19,0,0,Math.PI*2);ctx.stroke();
  const p=motion.pose(),w=summonerStaff(p),pt=([x,y])=>[cx+x*scale*motion.facing,floor-y*scale];
  const line=(a,b,color,width)=>{ctx.strokeStyle=color;ctx.lineWidth=width*scale;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(...pt(a));ctx.lineTo(...pt(b));ctx.stroke();};
  const poly=(points,color)=>{ctx.fillStyle=color;ctx.strokeStyle='#151627';ctx.lineWidth=scale*.7;ctx.beginPath();points.forEach((v,i)=>i?ctx.lineTo(...pt(v)):ctx.moveTo(...pt(v)));ctx.closePath();ctx.fill();ctx.stroke();};
  const ellipse=(v,rx,ry,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(...pt(v),rx*scale,ry*scale,0,0,Math.PI*2);ctx.fill();};
  const h=p.hip,s=p.shoulder,head=p.head;
  line(h,p.backKnee,'#29263d',7);line(p.backKnee,p.backFoot,'#191d31',6);line(p.backFoot,[p.backFoot[0]+6,p.backFoot[1]],'#111626',6);
  const elbow=[s[0]-6,s[1]-10];line([s[0]-5,s[1]-3],elbow,'#542b40',6);line(elbow,p.freeHand,'#f0c5b0',4);
  // Staff is drawn from exactly the public rig geometry, both orientations.
  line([w.butt.x,w.butt.y],[w.tip.x,w.tip.y],'#342731',3.4);
  line([w.butt.x,w.butt.y],[w.tip.x,w.tip.y],'#c5a46f',1.5);
  ellipse([w.tip.x,w.tip.y],3.5,4.5,'#a680e1');ellipse([w.tip.x,w.tip.y],1.6,2.7,'#f2dcff');
  const coatLean=(s[0]-h[0])*.6;
  // Original coat shading/trim and hair; not a DNF sprite or asset extraction.
  poly([[s[0]-7,s[1]],[s[0]+5,s[1]-2],[h[0]+8,h[1]+1],[h[0]+15-coatLean,h[1]-13],[h[0]-16-coatLean,h[1]-11],[h[0]-7,h[1]+2]],'#202238');
  poly([[s[0]-6,s[1]],[s[0]+5,s[1]-2],[h[0]+6,h[1]+3],[h[0]-6,h[1]+3]],'#762f48');
  poly([[h[0]-9,h[1]+3],[h[0]+8,h[1]+3],[h[0]+8,h[1]-1],[h[0]-9,h[1]-1]],'#d4b372');
  poly([[s[0]-5,s[1]-2],[s[0]-2,s[1]-4],[h[0]-4,h[1]+6],[h[0]-9,h[1]-7]],'#442a40');
  line([s[0]+4,s[1]-4],[h[0]+5,h[1]+4],'#c0915b',.7);
  poly([[s[0]-3,s[1]-3],[s[0]+4,s[1]-4],[s[0]+5,s[1]-9],[s[0]-2,s[1]-8]],'#bd7683');
  line([s[0]+1,s[1]+4],[head[0],head[1]-5],'#f0c5b0',5);
  poly([[head[0]-8,head[1]+6],[head[0]-14,head[1]-6],[head[0]-12,head[1]-24],[head[0]-6,head[1]-16],[head[0]-4,head[1]+1]],'#6d3b50');
  ellipse([head[0]-1,head[1]+1],9,12,'#6d3b50');
  poly([[head[0]-9,head[1]+5],[head[0]-14,head[1]-7],[head[0]-8,head[1]-13],[head[0]-5,head[1]+1]],'#6d3b50');
  poly([[head[0]-4,head[1]+7],[head[0]+5,head[1]+7],[head[0]+7,head[1]+1],[head[0]+10,head[1]-2],[head[0]+6,head[1]-3],[head[0]+5,head[1]-8],[head[0]-2,head[1]-7],[head[0]-5,head[1]-1]],'#f0c5b0');
  poly([[head[0]-8,head[1]+4],[head[0]-4,head[1]+12],[head[0]+5,head[1]+11],[head[0]+9,head[1]+6],[head[0]+3,head[1]+5],[head[0],head[1]+8],[head[0]-3,head[1]+1]],'#ba6870');
  line([head[0]+3,head[1]-1],[head[0]+6,head[1]-1],'#29263d',.8);
  line([head[0]-6,head[1]+7],[head[0]-2,head[1]+9],'#e09a93',1);
  ellipse([head[0]-6,head[1]+6],2.2,2.2,'#e5d398');
  const armElbow=[(s[0]+p.hand[0])/2+3,(s[1]+p.hand[1])/2-5];
  line([s[0]+5,s[1]-2],armElbow,'#852e46',6);line(armElbow,p.hand,'#f0c5b0',4);ellipse(p.hand,2.8,2.8,'#f4ccb4');
  line(h,p.frontKnee,'#354153',7);line(p.frontKnee,p.frontFoot,'#232238',6);line(p.frontFoot,[p.frontFoot[0]+7,p.frontFoot[1]],'#13192b',6);
  line(p.frontKnee,p.frontFoot,'#718194',.8);
  if(rig){line([w.butt.x,w.butt.y],[w.tip.x,w.tip.y],'#6cf5d6aa',4);for(const k of ['hip','shoulder','head','hand','frontKnee','backKnee'])ellipse(p[k],1.4,1.4,'#ffe39b');}
  ctx.fillStyle='#e9ddf6';ctx.font='600 24px sans-serif';ctx.fillText('SUMMONER / OWNER BASIC S4',34,46);
  ctx.font='13px sans-serif';ctx.fillStyle='#b6aac7';ctx.fillText('VICTIM IMPACT · HOLD · RECOVERY / original candidate',34,71);
  const frame=motion.preview??motion.action?.frame??30;
  ctx.fillStyle='#d9c3ff';ctx.font='16px monospace';ctx.fillText(`POSE ${String(Math.floor(frame)).padStart(2,'0')} / 30`,34,110);
  ctx.fillStyle='#b6aac7';ctx.font='13px sans-serif';ctx.fillText('Standing reaction comparison / PVE + PK appearance',34,515);
  drawSummonerImpactS3(ctx,motion);
  ctx.fillStyle='#b6aac7';ctx.font='14px monospace';ctx.fillText(`HITS ${motion.hitCount}   TARGET ${motion.target.hp} / 120`,34,143);
  ctx.fillStyle='#51413e';ctx.fillRect(34,156,168,5);ctx.fillStyle='#d5b681';ctx.fillRect(34,156,168*motion.target.hp/120,5);
  const ends=[10,18,30],colors=['#c7a1ff','#a290e4','#e4b48b'];let begin=0;
  for(let i=0;i<3;i++){ctx.fillStyle=colors[i];ctx.globalAlpha=motion.action?.stage===i?1:.35;ctx.fillRect(630+begin*9,94,(ends[i]-begin)*9-2,7);ctx.globalAlpha=1;begin=ends[i];}
  ctx.fillStyle='#f5edf9';ctx.fillRect(630+frame*9,88,2,19);ctx.restore();
}

function drawSummonerTargetS4(ctx,motion,rig){
 const t=motion.target;if(!t.present)return;const p=motion.targetPose(),scale=2.45,floor=402+t.lane*scale,player=motion.targetKind==='player';
 const pt=v=>[470+v.x*scale,floor-v.y*scale];
 const line=(a,b,width,color)=>{ctx.lineWidth=width*scale;ctx.strokeStyle=color;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(...pt(a));ctx.lineTo(...pt(b));ctx.stroke();};
 const skin=t.stop>0?'#f7e4b7':t.hp<=0?'#645750':player?'#d9b397':'#93aa6e',coat=player?'#914c43':'#536a4a',pants=player?'#323c59':'#544d39';
 ctx.fillStyle='#0f132188';ctx.beginPath();ctx.ellipse(...pt({x:t.x,y:-2}),32,9,0,0,Math.PI*2);ctx.fill();
 line(p.hip,p.backKnee,8,pants);line(p.backKnee,p.backFoot,6,pants);line(p.backFoot,{x:p.backFoot.x+4*motion.facing,y:p.backFoot.y},5,'#252733');
 line({x:p.shoulder.x-7*motion.facing,y:p.shoulder.y-4},p.backElbow,5,coat);line(p.backElbow,p.backHand,4,skin);
 ctx.fillStyle=t.stop>0?'#e4c9a0':coat;ctx.strokeStyle='#282b31';ctx.lineWidth=2;ctx.beginPath();
 for(const [i,a] of [[p.hip.x-9,p.hip.y],[p.shoulder.x-10,p.shoulder.y],[p.shoulder.x+10,p.shoulder.y],[p.hip.x+9,p.hip.y]].entries())i?ctx.lineTo(...pt({x:a[0],y:a[1]})):ctx.moveTo(...pt({x:a[0],y:a[1]}));
 ctx.closePath();ctx.fill();ctx.stroke();
 line(p.hip,p.frontKnee,8,pants);line(p.frontKnee,p.frontFoot,6,pants);line(p.frontFoot,{x:p.frontFoot.x+4*motion.facing,y:p.frontFoot.y},5,'#252733');
 ctx.fillStyle=skin;ctx.beginPath();ctx.ellipse(...pt(p.head),8*scale,9*scale,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 if(player){ctx.fillStyle='#3c303c';ctx.beginPath();ctx.ellipse(...pt({x:p.head.x,y:p.head.y+5}),8.5*scale,5*scale,0,Math.PI,Math.PI*2);ctx.fill();}
 else{line({x:p.head.x-9,y:p.head.y+3},{x:p.head.x-13,y:p.head.y+7},3,skin);line({x:p.head.x+9,y:p.head.y+3},{x:p.head.x+13,y:p.head.y+7},3,skin);}
 line({x:p.head.x-5*motion.facing,y:p.head.y+1},{x:p.head.x-2*motion.facing,y:p.head.y+1},.8,'#292b30');
 line({x:p.shoulder.x+7*motion.facing,y:p.shoulder.y-4},p.frontElbow,5,coat);line(p.frontElbow,p.frontHand,4,skin);
 if(rig){ctx.strokeStyle='#f3b879aa';ctx.lineWidth=1;for(const b of motion.targetBoxes())ctx.strokeRect(...pt({x:b.x0,y:b.y1}),(b.x1-b.x0)*scale,(b.y1-b.y0)*scale);}
 ctx.font='12px monospace';ctx.fillStyle='#d7c29d';ctx.fillText((player?'PK':'PVE')+' / '+p.phase,470+t.x*scale-42,floor+30);
}
function drawSummonerImpactS3(ctx,motion){
 for(const e of motion.effects){const u=e.age/.24,x=470+e.x*2.45,y=402-e.y*2.45;
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=Math.max(0,1-u);
  ctx.strokeStyle='#fbd9a1';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,4+u*(11+e.stage*3),0,Math.PI*2);ctx.stroke();
  for(let i=0;i<6;i++){const a=i*Math.PI/3+.17*e.stage,r=4+u*(13+e.stage*6);ctx.strokeStyle=i%2?'#e9ad6b':'#fff1ce';ctx.lineWidth=i%2?1.5:2.5;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.4,Math.sin(a)*r*.4);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();}
  ctx.fillStyle='#fff7df';ctx.beginPath();ctx.arc(0,0,Math.max(.6,4*(1-u)),0,Math.PI*2);ctx.fill();ctx.restore();
 }
}
