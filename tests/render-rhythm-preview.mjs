import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import {CombatRhythm} from '../prototype/combat-rhythm.mjs';
import {RhythmDemo} from '../prototype/rhythm-demo.mjs';
import {drawRhythm} from '../prototype/rhythm-renderer.mjs';
const req=createRequire(import.meta.url);
const {Canvas}=req(process.env.DNFKU_SKIA??process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@oai/artifact-tool/node_modules/skia-canvas');
const dir=new URL('../docs/evidence-v9/',import.meta.url);mkdirSync(dir,{recursive:true});mkdirSync(new URL('frames/',dir),{recursive:true});
const canvas=new Canvas(960,540),ctx=canvas.getContext('2d'),g=new CombatRhythm(),d=new RhythmDemo(g),timeline=[];
let saved=new Set(),eventCount=0;
for(let i=0;i<240;i++){
  for(let j=0;j<4;j++){if(!d.done)d.update();g.tick(1/120);}
  drawRhythm(ctx,g);ctx.fillStyle='#e8d3ae';ctx.font='15px sans-serif';ctx.fillText('V9 · '+d.phase,24,28);ctx.font='11px sans-serif';ctx.fillText('Skia生产绘制录像 · 非浏览器 / Android实机',24,515);
  await canvas.toFile(new URL('frames/'+String(i).padStart(4,'0')+'.png',dir).pathname);
  const a=g.fighter('A').controller.action,b=g.fighter('B');
  const fresh=g.events.slice(eventCount).find(e=>e.type==='damage');eventCount=g.events.length;
  if(fresh){drawRhythm(ctx,g,{debug:true});await canvas.toFile(new URL('impact-'+(fresh.cut??'launcher')+'.png',dir).pathname);}
  const tag=i===0?'idle':a?.phase==='active'?'cut-'+(a.cut??'launcher'):b.body.state==='airborne'?'airborne':b.body.state==='down'?'down':b.body.state==='invulnerable'?'protection':null;
  if(tag&&!saved.has(tag)){drawRhythm(ctx,g,{debug:true});await canvas.toFile(new URL(tag+'.png',dir).pathname);saved.add(tag);}
  timeline.push({frame:i,time:g.time,phase:d.phase,state:b.body.state,y:b.body.y,vy:b.body.vy,boxes:g.attackBoxes(g.fighter('A')),hp:b.hp});
}
writeFileSync(new URL('timeline.json',dir),JSON.stringify({kind:'Skia production renderer, not browser',events:g.events,timeline},null,2));
console.log(JSON.stringify({phase:d.phase,done:d.done,frames:240,keyframes:[...saved]}));
