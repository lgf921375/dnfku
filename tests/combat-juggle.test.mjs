import test from 'node:test';
import assert from 'node:assert/strict';
import {CombatJuggle} from '../prototype/combat-juggle.mjs';
import {bladeContact} from '../prototype/combat-feedback.mjs';
import {RhythmDemo} from '../prototype/rhythm-demo.mjs';
const advance=(g,predicate,limit=1200)=>{for(let i=0;i<limit&&!predicate();i++)g.tick(1/120);assert.ok(predicate(),'timed out');};
const hold=(g,until,limit=1200)=>{let next=g.time;for(let i=0;i<limit&&!until();i++){if(g.time>=next){g.basic();next=g.time+.15;}g.tick(1/120);}assert.ok(until(),'hold timed out');};
test('public held attack: third standing contact lifts, later blade contacts change falling velocity',()=>{
  const g=new CombatJuggle();hold(g,()=>g.events.filter(e=>e.before?.state==='airborne').length>=2);
  const hits=g.events.filter(e=>e.type==='damage');
  assert.deepEqual(hits.slice(0,3).map(e=>[e.cut,e.after.state]),[[0,'idle'],[1,'idle'],[2,'airborne']]);
  assert.equal(hits[2].reaction,'launch');
  for(const e of hits.filter(e=>e.before.state==='airborne')){
    assert.ok(e.before.vy<0);assert.ok(e.after.vy>0);assert.equal(e.before.y,e.after.y);
    assert.deepEqual(bladeContact(e.contact.blade.hand,e.contact.blade.tip,e.contact.targetBox),e.contact.point);
  }
});
test('rising finisher blade climbs during active frames and only one damage occurs per swing',()=>{
  const g=new CombatJuggle();let next=0,points=[];
  for(let i=0;i<180;i++){
    if(g.time>=next){g.basic();next=g.time+.15;}
    g.tick(1/120);const f=g.fighter('A'),a=f.controller.action;
    if(a?.cut===2&&a.phase==='active')points.push(g.weapon(f).tip.y);
  }
  assert.ok(Math.max(...points)-Math.min(...points)>2);
  const times=g.events.filter(e=>e.type==='damage'&&e.cut===2).map(e=>e.time);
  assert.equal(times.length,1);
});
test('no more contact after follow-up: gravity and natural landing continue, no automatic relaunch',()=>{
  const g=new CombatJuggle();hold(g,()=>g.events.some(e=>e.before?.state==='airborne'));
  const b=g.fighter('B'),count=g.events.filter(e=>e.type==='damage').length;
  advance(g,()=>b.body.hitstopRemaining===0);const vy=b.body.vy;g.tick(.05);assert.ok(b.body.vy<vy);
  advance(g,()=>b.body.state==='down');assert.equal(b.body.y,0);assert.equal(b.body.vy,0);
  assert.equal(g.events.filter(e=>e.type==='damage').length,count);
  advance(g,()=>b.body.state==='idle');assert.ok(b.body.events.some(e=>e.type==='ordinary-stand'));
});
test('unreachable height (gravity=12 stress case), distance and lane reject public attacks',()=>{
  const high=new CombatJuggle({settings:{gravity:12}});high.press('A','launcher');
  advance(high,()=>!high.fighter('A').controller.action&&high.fighter('B').body.y>3);
  const hp=high.fighter('B').hp;high.basic();high.tick(.4);assert.equal(high.fighter('B').hp,hp);
  for(const axis of ['distance','lane']){
    const g=new CombatJuggle();g.setInput('A',axis==='distance'?-1:0,axis==='lane'?-1:0);g.tick(.7);g.clearInputs();
    if(axis==='distance'){g.setInput('A',1,0);g.tick(.05);g.clearInputs();}
    g.basic();g.tick(.5);assert.equal(g.events.filter(e=>e.type==='damage').length,0,axis);
    assert.equal(g.fighter('B').body.state,'idle');
  }
});
test('public demo covers launch, two air follows, natural drop, ground-limit and protected recovery',()=>{
  const g=new CombatJuggle(),d=new RhythmDemo(g);for(let i=0;i<1600&&!d.done;i++){d.update();g.tick(1/120);}
  assert.equal(d.phase,'保护起身');assert.equal(g.events.filter(e=>e.reaction==='air').length,2);
  assert.equal(g.events.filter(e=>e.before?.state==='down').length,3);
  const b=g.fighter('B');assert.ok(b.body.events.some(e=>e.type==='forced-stand'&&e.reason==='ground-limit'));
  const hp=b.hp;hold(g,()=>g.time>6.75);assert.equal(b.hp,hp);
  g.tick(.5);assert.equal(b.body.state,'idle');
});
test('continuous real attacks still hit original protection threshold; no infinite juggling',()=>{
  const g=new CombatJuggle();hold(g,()=>g.fighter('B').body.state==='invulnerable');
  const b=g.fighter('B'),stand=b.body.events.find(e=>e.type==='forced-stand');
  assert.ok(stand.airHits===g.settings.airHitLimit||stand.totalHits===g.settings.totalHitLimit);
  assert.equal(b.body.y,0);assert.equal(b.body.vy,0);const hp=b.hp;
  for(let i=0;i<30;i++){g.basic();g.tick(1/120);}assert.equal(b.hp,hp);
});
