import {readFileSync,writeFileSync} from 'node:fs';
import {loadDFQActionPack} from './dfq-action-pack.mjs';
const here=n=>new URL(n,import.meta.url);
const pack=JSON.stringify(loadDFQActionPack()).replaceAll('<','\\u003c');
const font=readFileSync(here('fonts/dfq-action-ui.woff')).toString('base64');
const license=`<script type="text/plain" id="source-licenses">${readFileSync(here('vendor/dfq-original/LICENSE'),'utf8')}\n${readFileSync(here('vendor/fengari-web/LICENSES.txt'),'utf8')}\n${readFileSync(here('fonts/OFL.txt'),'utf8')}</script>`;
const template=readFileSync(here('dfq-action-lab.template.html'),'utf8');
writeFileSync(here('dfq-action-lab.html'),template.replace('/* FONT */',()=>`@font-face{font-family:SourceFont;src:url(data:font/woff;base64,${font}) format('woff');font-display:swap}`).replace('/* RUNTIME */',()=>readFileSync(here('vendor/fengari-web/fengari-web.js'),'utf8').replace(/\/\/# sourceMappingURL=.*$/m,'')).replace('/* ADAPTER */',()=>readFileSync(here('dfq-core-runtime.mjs'),'utf8').replace(/^export /gm,'')).replace('/* PACK */',()=>pack).replace('</head>',()=>license+'</head>'));
