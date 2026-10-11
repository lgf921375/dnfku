import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CombatRhythm,CUTS} from '../prototype/combat-rhythm.mjs';
import {RhythmDemo} from '../prototype/rhythm-demo.mjs';
const ready=()=>{const g=new CombatRhythm();g.fighter('B').body.enemyX=.9;return g;};
test('three cuts advance only when an action actually starts and expire naturally',()=>{
  const g=ready(),a=g.fighter('A');g.basic();assert.equal(a.controller.action.cut,0);
  while(a.controller.action)g.tick(1/120);g.basic();assert.equal(a.controller.action.cut,1);
  while(a.controller.action)g.tick(1/120);g.basic();assert.equal(a.controller.action.cut,2);
  g.tick(2);g.basic();assert.equal(a.controller.action.cut,0);
});
test('each cut has distinct time, damage and feedback; demo completes from real inputs',()=>{
  const g=ready(),d=new RhythmDemo(g);for(let i=0;i<1200&&!d.done;i++){d.update();g.tick(1/120);}
  assert.equal(d.phase,'保护起身');
  assert.deepEqual(g.events.filter(e=>e.type==='damage').slice(0,3).map(e=>e.damage),[12,14,22]);
  const body=g.fighter('B').body;assert.ok(body.events.some(e=>e.type==='landed'));assert.ok(body.events.some(e=>e.type==='forced-stand'&&e.reason==='ground-limit'));
  assert.ok(g.events.filter(e=>e.type==='damage'&&e.skill==='highSlash').length>=6);
});
test('same three-cut attack damages a down target without switching skill',()=>{
  const g=ready(),b=g.fighter('B');b.body.state='down';b.body.downRemaining=.9;g.basic();g.tick(.22);
  assert.equal(b.hp,588);assert.equal(b.body.groundHits,1);assert.equal(g.events.find(e=>e.type==='damage').skill,'highSlash');
});
test('high target and wrong lane miss; protected overlapping target cannot take damage',()=>{
  for(const kind of ['high','lane','protected']){const g=ready(),b=g.fighter('B');
    if(kind==='high'){b.body.state='airborne';b.body.y=5;b.body.vy=0;}if(kind==='lane')b.lane=1;
    if(kind==='protected'){b.body.state='invulnerable';b.body.invulnerabilityRemaining=.6;}
    g.basic();g.tick(.19);assert.equal(b.hp,600,kind);
  }
});
test('independent hitstop freezes pose clock and action progress for configured durations',()=>{
  const g=ready();g.feel.attackerStop=2;g.feel.victimStop=.5;g.basic();while(!g.events.some(e=>e.type==='damage'))g.tick(1/120);
  const a=g.fighter('A'),b=g.fighter('B');assert.ok(a.controller.attackerHitstopRemaining>.07);assert.ok(b.body.hitstopRemaining<.03);
  const elapsed=a.controller.action.elapsed,pose=a.poseTime;g.tick(.03);assert.equal(a.controller.action.elapsed,elapsed);assert.equal(a.poseTime,pose);
  g.tick(.08);assert.ok(a.controller.action.elapsed>elapsed);
});
test('air impact uses relative momentum and heavy cut accelerates downward',()=>{
  for(const cut of [0,1,2]){const g=ready(),a=g.fighter('A'),b=g.fighter('B');g.basic();a.controller.action.cut=cut;
    a.controller.frames.highSlash={...CUTS[cut]};b.body.state='airborne';b.body.y=1;b.body.vy=2;g.tick(CUTS[cut].startup+CUTS[cut].active);
    const e=g.events.find(e=>e.type==='impact-feedback');assert.ok(e);
    if(cut===2)assert.ok(e.vy<=-2.4);else assert.notEqual(e.vy,g.settings.airTapVelocity);
  }
});
test('guard and armor keep original damage/interruption policy',()=>{
  const g=ready(),b=g.fighter('B');g.setGuard('B',true);g.basic();g.tick(.22);assert.equal(b.hp,600);assert.ok(g.events.some(e=>e.type==='guard'));
  const h=ready(),victim=h.fighter('B');victim.facing=1;h.basic();h.press('B','launcher');h.tick(.15);assert.ok(h.events.some(e=>e.type==='damage'&&e.target==='B'&&e.armored));assert.ok(victim.controller.action);
});
test('V9 page embeds the tested production modules verbatim',()=>{
  const names=['combat-core.mjs','combat-actions.mjs','combat-interrupts.mjs','combat-duel.mjs','combat-scroll.mjs','combat-contact.mjs','combat-rhythm.mjs','rhythm-renderer.mjs','rhythm-demo.mjs'];
  const source=names.map(n=>readFileSync(new URL('../prototype/'+n,import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace(/^export /gm,'')).join('\n');
  const expected=readFileSync(new URL('../prototype/rhythm-lab.template.html',import.meta.url),'utf8').replace('/* COMBAT_MODULES */',()=>source);
  assert.equal(readFileSync(new URL('../prototype/rhythm-lab-v9.html',import.meta.url),'utf8'),expected);
});
