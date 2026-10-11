import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CombatFeedback,bladeContact} from '../prototype/combat-feedback.mjs';
import {feedbackPose} from '../prototype/feedback-renderer.mjs';
import {RhythmDemo} from '../prototype/rhythm-demo.mjs';
test('blade narrow phase rejects diagonal AABB corners, handles crossing and zero length',()=>{
  assert.equal(bladeContact({x:0,y:0},{x:2,y:2},{x0:1.4,x1:1.6,y0:0,y1:.2}),null);
  assert.ok(bladeContact({x:0,y:0},{x:2,y:2},{x0:.9,x1:1.1,y0:.9,y1:1.1}));
  assert.ok(bladeContact({x:1,y:1},{x:1,y:1},{x0:.9,x1:1.1,y0:.9,y1:1.1}));
  assert.equal(bladeContact({x:1,y:1},{x:1,y:1},{x0:2,x1:3,y0:2,y1:3}),null);
});
test('public input demo retains launch, air contact, down contact, forced stand and immunity',()=>{
  const g=new CombatFeedback(),d=new RhythmDemo(g);for(let i=0;i<1600&&!d.done;i++){d.update();g.tick(1/120);}
  assert.equal(d.phase,'保护起身');const b=g.fighter('B');
  assert.ok(g.events.some(e=>e.reaction==='air'));assert.ok(g.events.some(e=>e.reaction==='ground'));
  assert.ok(b.body.events.some(e=>e.type==='forced-stand'&&e.reason==='ground-limit'));
  assert.equal(b.body.state,'invulnerable');const hp=b.hp;
  for(let i=0;i<30;i++){g.basic();g.tick(1/120);}assert.equal(b.hp,hp);
  assert.ok(g.events.filter(e=>e.reaction==='ground').every(e=>e.skill==='highSlash'));
});
test('reaction pose and reaction clock freeze with victim hitstop and recover afterward',()=>{
  const g=new CombatFeedback();g.basic();while(!g.fighter('B').reaction)g.tick(1/120);
  const b=g.fighter('B'),p=feedbackPose(b),age=b.reaction.age;g.tick(.02);
  assert.equal(b.reaction.age,age);assert.deepEqual(feedbackPose(b),p);
  g.tick(.1);assert.ok(b.reaction.age>age);assert.notDeepEqual(feedbackPose(b),p);
});
test('three real hits select distinct poses and stun derived from existing active plus recovery',()=>{
  const g=new CombatFeedback(),d=new RhythmDemo(g),poses=[];
  for(let i=0;i<180;i++){d.update();g.tick(1/120);const b=g.fighter('B');if(b.reaction&&!poses.some(p=>p.kind===b.reaction.kind))poses.push({kind:b.reaction.kind,pose:feedbackPose(b)});}
  assert.deepEqual(poses.slice(0,3).map(p=>p.kind),['light','reverse','heavy']);
  assert.notDeepEqual(poses[0].pose,poses[1].pose);assert.notDeepEqual(poses[1].pose,poses[2].pose);
  assert.deepEqual(g.events.filter(e=>e.type==='damage').slice(0,3).map(e=>Math.round(e.hitstun*1000)),[255,250,340]);
});
test('V10 offline page contains exact production code and recording control',()=>{
  const files=['combat-core.mjs','combat-actions.mjs','combat-interrupts.mjs','combat-duel.mjs','combat-scroll.mjs','combat-contact.mjs','combat-rhythm.mjs','rhythm-renderer.mjs','rhythm-demo.mjs','combat-feedback.mjs','feedback-renderer.mjs'];
  const source=files.map(n=>readFileSync(new URL('../prototype/'+n,import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace(/^export /gm,'')).join('\n');
  const template=readFileSync(new URL('../prototype/feedback-lab.template.html',import.meta.url),'utf8');
  assert.equal(readFileSync(new URL('../prototype/feedback-lab-v10.html',import.meta.url),'utf8'),template.replace('/* COMBAT_MODULES */',()=>source));
  assert.ok(template.includes('MediaRecorder'));assert.ok(template.includes('captureStream(30)'));
});
