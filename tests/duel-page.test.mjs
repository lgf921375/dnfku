import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const root=new URL('../prototype/',import.meta.url);
test('V6 offline page embeds exact tested module sources',()=>{
  const source=['combat-core.mjs','combat-actions.mjs','combat-interrupts.mjs','combat-duel.mjs'].map(name=>readFileSync(new URL(name,root),'utf8').replace(/^import .*;\n/gm,'').replace(/^export /gm,'')).join('\n');
  const template=readFileSync(new URL('duel-lab.template.html',root),'utf8');
  const html=readFileSync(new URL('duel-lab-v6.html',root),'utf8');
  assert.equal(html,template.replace('/* COMBAT_MODULES */',()=>source));
  new vm.Script(html.match(/<script>([\s\S]*)<\/script>/)[1]);
});
