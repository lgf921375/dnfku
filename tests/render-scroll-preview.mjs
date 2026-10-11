/** Runs the production Canvas renderer through Skia; not a browser screenshot. */
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {CombatScroll} from '../prototype/combat-scroll.mjs';
import {drawScroll} from '../prototype/scroll-renderer.mjs';
const req=createRequire(import.meta.url);
const {Canvas}=req(process.env.DNFKU_SKIA??process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@oai/artifact-tool/node_modules/skia-canvas');
const dir=new URL('../docs/evidence-v7/',import.meta.url);mkdirSync(dir,{recursive:true});
const canvas=new Canvas(960,540);const ctx=canvas.getContext('2d');
const scene=new CombatScroll();drawScroll(ctx,scene);await canvas.toFile(new URL('idle.png',dir).pathname);
scene.press('A','launcher');scene.tick(.1);drawScroll(ctx,scene);await canvas.toFile(new URL('impact.png',dir).pathname);
scene.tick(.28);drawScroll(ctx,scene);await canvas.toFile(new URL('airborne.png',dir).pathname);
scene.tick(.85);scene.basic();scene.tick(.075);drawScroll(ctx,scene);await canvas.toFile(new URL('sweep.png',dir).pathname);
console.log('PASS production Canvas renderer: idle / impact / airborne / sweep, 4 PNGs (Skia, not Chromium).');
