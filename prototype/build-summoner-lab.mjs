import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const here=n=>new URL(n,import.meta.url);
const source=['summoner-motion.mjs','summoner-renderer.mjs'].map(n=>readFileSync(here(n),'utf8').replace(/^import .*;\n/gm,'').replace(/^export /gm,'')).join('\n');
const font=here('fonts/summoner-ui.woff');
const css=existsSync(font)?`@font-face{font-family:MotionFont;src:url(data:font/woff;base64,${readFileSync(font).toString('base64')}) format('woff');font-display:swap}`:'';
const license=existsSync(font)?`<script type="text/plain" id="font-license">Noto Sans CJK SC subset. Copyright notice retained in the font name table.\nSource: https://github.com/notofonts/noto-cjk\n${readFileSync(here('fonts/OFL.txt'),'utf8')}</script>`:'';
writeFileSync(here('summoner-lab-s1.html'),readFileSync(here('summoner-lab.template.html'),'utf8').replace('/* SUMMONER_MODULES */',()=>source).replace('/* OFFLINE_FONT */',()=>css).replace('</head>',()=>license+'</head>'));
