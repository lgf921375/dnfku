import {readFileSync,writeFileSync} from 'node:fs';
const files=['combat-core.mjs','combat-actions.mjs','combat-interrupts.mjs','combat-duel.mjs','combat-scroll.mjs','combat-contact.mjs','combat-rhythm.mjs','rhythm-renderer.mjs','rhythm-demo.mjs'];
const source=files.map(name=>readFileSync(new URL(name,import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace(/^export /gm,'')).join('\n');
writeFileSync(new URL('rhythm-lab-v9.html',import.meta.url),readFileSync(new URL('rhythm-lab.template.html',import.meta.url),'utf8').replace('/* COMBAT_MODULES */',()=>source));
