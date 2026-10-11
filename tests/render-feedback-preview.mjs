import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import {CombatFeedback} from '../prototype/combat-feedback.mjs';
import {CombatRhythm} from '../prototype/combat-rhythm.mjs';
import {RhythmDemo} from '../prototype/rhythm-demo.mjs';
import {drawFeedback} from '../prototype/feedback-renderer.mjs';
import {drawRhythm} from '../prototype/rhythm-renderer.mjs';
const req=createRequire(import.meta.url),{Canvas}=req(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@oai/artifact-tool/node_modules/skia-canvas');
const dir=new URL('../docs/evidence-v10/',import.meta.url);mkdirSync(new URL('frames/',dir),{recursive:true});
const canvas=new Canvas(1920,600),ctx=canvas.getContext('2d');
const games=[new CombatRhythm(),new CombatFeedback()],demos=games.map(g=>new RhythmDemo(g)),draws=[drawRhythm,drawFeedback];
const images=[new Map(),new Map()],seen=[new Set(),new Set()],timeline=[];
for(let frame=0;frame<240;frame++){
  for(let j=0;j<4;j++)games.forEach((g,i)=>{if(!demos[i].done)demos[i].update();g.tick(1/120);});
  ctx.fillStyle='#0b1220';ctx.fillRect(0,0,1920,600);
  for(let i=0;i<2;i++){
    const g=games[i],b=g.fighter('B');ctx.save();ctx.translate(i*960,30);draws[i](ctx,g);ctx.restore();
    ctx.fillStyle='#ecd3a2';ctx.font='bold 19px sans-serif';ctx.fillText(i?'V10: contact + reaction sequence':'V9: baseline',i*960+22,23);
    ctx.font='12px sans-serif';ctx.fillText('MODEL RENDER / NOT BROWSER OR ANDROID RECORDING',i*960+22,590);
    const e=g.events.filter(e=>e.type==='damage').at(-1),age=e?g.time-e.time:9;
    let tag=age<.04?'hit-'+(e.cut??'launcher'):b.body.state==='airborne'?'airborne':b.body.state==='down'?'down':b.body.state==='invulnerable'?'protection':b.recovery?.kind==='rise'?'rise':null;
    if(tag&&!seen[i].has(tag)){
      const c=new Canvas(960,540);draws[i](c.getContext('2d'),g,{debug:tag.startsWith('hit')});
      images[i].set(tag,c);await c.toFile(new URL((i?'v10-':'v9-')+tag+'.png',dir).pathname);seen[i].add(tag);
    }
    timeline.push({frame,version:i?'V10':'V9',time:g.time,state:b.body.state,hp:b.hp,y:b.body.y,vy:b.body.vy,reaction:b.reaction?{...b.reaction,from:undefined}:null,phase:demos[i].phase});
  }
  await canvas.toFile(new URL('frames/'+String(frame).padStart(4,'0')+'.png',dir).pathname);
}
const tags=['hit-0','hit-1','hit-2','airborne','down','protection'];
const sheet=new Canvas(1440,610),sc=sheet.getContext('2d');sc.fillStyle='#0b1220';sc.fillRect(0,0,1440,610);
for(let i=0;i<2;i++)for(let j=0;j<tags.length;j++){
  const pic=images[i].get(tags[j]);if(pic)sc.drawImage(pic,j*240,30+i*290,240,135);
  sc.fillStyle='#edcf9a';sc.font='13px sans-serif';sc.fillText((i?'V10 ':'V9 ')+tags[j],j*240+5,20+i*290);
}
// Larger side-by-side light/heavy reactions for visual inspection.
const detail=new Canvas(1920,1120),dc=detail.getContext('2d');dc.fillStyle='#0b1220';dc.fillRect(0,0,1920,1120);
for(let i=0;i<2;i++)for(let j=0;j<2;j++){dc.drawImage(images[i].get(j?'hit-2':'hit-0'),i*960,20+j*550);dc.fillStyle='#edcf9a';dc.font='18px sans-serif';dc.fillText((i?'V10 ':'V9 ')+(j?'heavy':'light'),i*960+20,18+j*550);}
await detail.toFile(new URL('reaction-comparison.png',dir).pathname);await sheet.toFile(new URL('keyframes.jpg',dir).pathname);
writeFileSync(new URL('timeline.json',dir),JSON.stringify({kind:'Skia model render, NOT browser/Android',frames:240,fps:30,events:games.map(g=>g.events),bodyEvents:games.map(g=>g.fighter('B').body.events),timeline},null,2));
console.log(JSON.stringify({kind:'Skia model render only',phases:demos.map(d=>d.phase),done:demos.map(d=>d.done),frames:240,saved:seen.map(s=>[...s])}));
