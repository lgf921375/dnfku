import {readFileSync,writeFileSync} from 'node:fs';
const here=n=>new URL(n,import.meta.url);
const source=['summoner-motion.mjs','summoner-motion-s2.mjs','summoner-renderer-s2.mjs'].map(n=>readFileSync(here(n),'utf8').replace(/^import .*;\n/gm,'').replace(/^export /gm,'')).join('\n');
const font=readFileSync(here('fonts/summoner-ui.woff')).toString('base64');
const css=`@font-face{font-family:MotionFont;src:url(data:font/woff;base64,${font}) format('woff');font-display:swap}`;
const license=`<script type="text/plain" id="font-license">Noto Sans CJK SC subset. Copyright notice retained in font.\n${readFileSync(here('fonts/OFL.txt'),'utf8')}</script>`;
const template=readFileSync(here('summoner-lab.template.html'),'utf8').replaceAll('S1','S2')
 .replace('new SummonerMotion()','new SummonerMotionS2()').replace('drawSummoner(ctx','drawSummonerS2(ctx')
 .replaceAll('压低身体收杖','空中收杖').replaceAll('压低收杖','空中收杖')
 .replace('summoner-s1-canvas.webm','summoner-s2-canvas.webm');
writeFileSync(here('summoner-lab-s2.html'),template.replace('/* SUMMONER_MODULES */',()=>source).replace('/* OFFLINE_FONT */',()=>css).replace('</head>',()=>license+'</head>'));
