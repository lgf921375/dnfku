/** Rebuild the offline page directly from tested modules; no manual code copies. */
import {readFileSync,writeFileSync} from 'node:fs';
const files=['combat-core.mjs','combat-actions.mjs','combat-interrupts.mjs','combat-duel.mjs'];
const source=files.map(name=>readFileSync(new URL(name,import.meta.url),'utf8')
  .replace(/^import .*;\n/gm,'').replace(/^export /gm,'')).join('\n');
const template=readFileSync(new URL('duel-lab.template.html',import.meta.url),'utf8');
writeFileSync(new URL('duel-lab-v6.html',import.meta.url),template.replace('/* COMBAT_MODULES */',()=>source));
