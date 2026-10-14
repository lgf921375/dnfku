import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const here=n=>new URL(n,import.meta.url),vendor='vendor/dfq-original/';
const lock=JSON.parse(readFileSync(here(vendor+'source-lock.json'),'utf8')),sources={};
for(const e of lock.files){const bytes=readFileSync(here(vendor+e.path));const blob=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');if(blob!==e.blobSHA)throw Error('Imported bytes differ: '+e.path);
 if(e.path.startsWith('source/'))sources[e.path.slice(7,-4).replaceAll('/','.')]=bytes.toString('utf8');if(e.path.startsWith('config/'))sources['fixture.'+e.path.split('/').at(-1).slice(0,-4)]=bytes.toString('utf8');}
const pack=JSON.stringify({sources,platform:readFileSync(here('dfq-platform.lua'),'utf8'),fixture:readFileSync(here('dfq-fixture.lua'),'utf8'),lock}).replaceAll('<','\\u003c');
const font=readFileSync(here('fonts/dfq-source-ui.woff')).toString('base64');
const license=`<script type="text/plain" id="source-licenses">${readFileSync(here(vendor+'LICENSE'),'utf8')}\n${readFileSync(here('vendor/fengari-web/LICENSES.txt'),'utf8')}\n${readFileSync(here('fonts/OFL.txt'),'utf8')}</script>`;
const template=readFileSync(here('dfq-source-lab.template.html'),'utf8');
writeFileSync(here('dfq-source-lab.html'),template.replace('/* FONT */',()=>`@font-face{font-family:SourceFont;src:url(data:font/woff;base64,${font}) format('woff');font-display:swap}`).replace('/* RUNTIME */',()=>readFileSync(here('vendor/fengari-web/fengari-web.js'),'utf8').replace(/\/\/# sourceMappingURL=.*$/m,'')).replace('/* ADAPTER */',()=>readFileSync(here('dfq-core-runtime.mjs'),'utf8').replace(/^export /gm,'')).replace('/* PACK */',()=>pack).replace('</head>',()=>license+'</head>'));
