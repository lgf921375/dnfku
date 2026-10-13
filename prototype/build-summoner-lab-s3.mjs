import {readFileSync,writeFileSync} from 'node:fs';
const here=n=>new URL(n,import.meta.url);
const modules=['summoner-motion.mjs','summoner-motion-s2.mjs','summoner-feedback-s3.mjs','summoner-impact-audio.mjs','summoner-renderer-s3.mjs'];
const source=modules.map(n=>readFileSync(here(n),'utf8').replace(/^import .*;\n/gm,'').replace(/^export /gm,'')).join('\n');
const font=readFileSync(here('fonts/summoner-s3-ui.woff')).toString('base64');
const css=`@font-face{font-family:MotionFont;src:url(data:font/woff;base64,${font}) format('woff');font-display:swap}`;
const license=`<script type="text/plain" id="font-license">Noto Sans CJK SC subset.\n${readFileSync(here('fonts/OFL.txt'),'utf8')}</script>`;
const template=readFileSync(here('summoner-lab-s3.template.html'),'utf8');
writeFileSync(here('summoner-lab-s3.html'),template.replace('/* SUMMONER_MODULES */',()=>source).replace('/* OFFLINE_FONT */',()=>css).replace('</head>',()=>license+'</head>'));
