import {readFileSync,writeFileSync} from 'node:fs';
const files=['combat-core.mjs','combat-actions.mjs','combat-interrupts.mjs','combat-duel.mjs','combat-scroll.mjs','combat-contact.mjs','combat-rhythm.mjs','rhythm-renderer.mjs','rhythm-demo.mjs','combat-feedback.mjs','feedback-renderer.mjs','combat-juggle.mjs'];
const source=files.map(n=>readFileSync(new URL(n,import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace(/^export /gm,'')).join('\n');
const template=readFileSync(new URL('feedback-lab.template.html',import.meta.url),'utf8')
  .replaceAll('V10','V11').replaceAll('v10','v11').replaceAll('CombatFeedback(','CombatJuggle(')
  .replace('drawFeedback(ctx,game,{debug:debugBoxes})','drawJuggle(ctx,game,{debug:debugBoxes})')
  .replace('叁 · 重斩','叁 · 挑斩').replace('受击动作与刀刃接触','末段挑斩与接触续浮空');
writeFileSync(new URL('juggle-lab-v11.html',import.meta.url),template.replace('/* COMBAT_MODULES */',()=>source));
