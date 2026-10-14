import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {createDFQCore} from '../prototype/dfq-core-runtime.mjs';
const require=createRequire(import.meta.url),runtimeRoot=process.env.DNFKU_DFQ_RUNTIME;
if(!runtimeRoot)throw new Error('Set DNFKU_DFQ_RUNTIME to the isolated pinned runtime directory');
const fengari=require(path.join(runtimeRoot,'node_modules/fengari'));
const base=new URL('../prototype/',import.meta.url),vendor=new URL('vendor/dfq-original/',base);
const read=p=>fs.readFileSync(new URL(p,base),'utf8'),lock=JSON.parse(fs.readFileSync(new URL('source-lock.json',vendor),'utf8')),sources={};
for(const e of lock.files){if(e.path.startsWith('source/'))sources[e.path.slice(7,-4).replaceAll('/','.')]=fs.readFileSync(new URL(e.path,vendor),'utf8');if(e.path.startsWith('config/'))sources['fixture.'+e.path.split('/').at(-1).slice(0,-4)]=fs.readFileSync(new URL(e.path,vendor),'utf8');}
const make=()=>createDFQCore(fengari,sources,read('dfq-platform.lua'),read('dfq-fixture.lua'));
const ticks=(c,n)=>{let s;for(let i=0;i<n;i++)s=c.call('tick',17);return s;};
test('every imported source byte matches its upstream Git blob and SHA256 lock',()=>{
 for(const e of lock.files){const bytes=fs.readFileSync(new URL(e.path,vendor));assert.equal(createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex'),e.blobSHA,e.path);assert.equal(createHash('sha256').update(bytes).digest('hex'),e.sha256,e.path);}
 assert.equal(lock.files.length,41);
});
test('actual Attack.Update confirms contact, upstream HP callback and independent 100/50ms stops',()=>{
 const c=make();try{const s=c.call('strike',1,false);assert.equal(s.hp,108);assert.equal(s.state,'stun');assert.equal(s.targetStop,100);assert.equal(s.ownerStop,50);assert(s.paused&&s.ownerPaused);assert.equal(s.events.filter(e=>e.type==='hit').length,1);}finally{c.close();}
});
test('upstream target dedup prevents repeated HP loss across an open attack window',()=>{
 const c=make();try{c.call('strike',1,false);const s=ticks(c,20);assert.equal(s.hp,108);assert.equal(s.events.filter(e=>e.type==='hit').length,1);}finally{c.close();}
});
test('actual SolidRect.DefaultCollide rejects depth-separated and high versus down fixtures',()=>{
 const c=make();try{c.call('reset','stay',100,false,false);assert.equal(c.call('strike',1,false).hp,120);c.call('reset','down',0,false,false);assert.equal(c.call('strike',1,false).hp,120);}finally{c.close();}
});
test('a low third attack hits down and uses upstream low rebound path without standing hurt',()=>{
 const c=make();try{c.call('reset','down',0,false,false);const s=c.call('strike',3,true);assert.equal(s.hp,108);assert.equal(s.state,'flight');const after=ticks(c,100);assert(after.events.some(e=>e.type==='state'&&e.state==='down'));assert(after.events.some(e=>e.type==='state'&&e.state==='sit'));}finally{c.close();}
});
test('actual flight/easemove produces rise, fall, rebound, down500ms and sit150ms',()=>{
 const c=make();try{c.call('strike',3,true);const seen=[];for(let i=0;i<120;i++)seen.push(c.call('tick',17));assert(seen.some(s=>s.height>20));const events=seen.at(-1).events;const down=events.find(e=>e.type==='state'&&e.state==='down'),sit=events.find(e=>e.type==='state'&&e.state==='sit'),stay=events.find(e=>e.type==='state'&&e.state==='stay');assert(down&&sit&&stay);assert.equal(sit.time-down.time,510);assert.equal(stay.time-sit.time,153);assert.equal(seen.at(-1).hp,108);}finally{c.close();}
});
test('upstream stun and flight prohibitions preserve armor while damage remains enabled',()=>{
 const c=make();try{c.call('reset','stay',0,true,false);const s=c.call('strike',3,true);assert.equal(s.hp,108);assert.equal(s.state,'stay');assert.equal(s.height,0);}finally{c.close();}
});
test('upstream sit state rejects further attack until its time-end transition',()=>{
 const c=make();try{c.call('reset','down',0,false,false);let s=ticks(c,30);assert.equal(s.state,'sit');assert.equal(s.banAttack,1);assert.equal(c.call('strike',3,true).hp,120);c.call('closeWindow');s=ticks(c,10);assert.equal(s.state,'stay');assert.equal(s.banAttack,0);}finally{c.close();}
});
test('an explicitly held-open source hit window can hit once after sit immunity ends',()=>{
 const c=make();try{c.call('reset','down',0,false,false);ticks(c,30);assert.equal(c.call('strike',3,true).hp,120);const s=ticks(c,10);assert.equal(s.state,'flight');assert.equal(s.hp,108);assert.equal(s.events.filter(e=>e.type==='hit').length,1);}finally{c.close();}
});
test('a prior miss still consumes upstream damage randomization without creating a hit',()=>{
 const c=make();try{c.call('reset','down',0,false,false);assert.equal(c.call('strike',1,false).hp,120);const s=c.call('strike',3,true),hits=s.events.filter(e=>e.type==='hit');assert.equal(hits.length,1);assert.equal(hits[0].damage,13);assert.equal(s.hp,107);}finally{c.close();}
});
