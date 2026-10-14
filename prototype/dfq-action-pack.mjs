import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const here=n=>new URL(n,import.meta.url);
export function loadDFQActionPack(){
 const vendor='vendor/dfq-original/',base=JSON.parse(readFileSync(here(vendor+'source-lock.json'),'utf8')),action=JSON.parse(readFileSync(here(vendor+'action-lock.json'),'utf8')),sources={};
 for(const e of [...base.files,...action.files]){
  const b=readFileSync(here(vendor+e.path));
  if(createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex')!==e.blobSHA||createHash('sha256').update(b).digest('hex')!==e.sha256)throw Error('Upstream bytes differ: '+e.path);
  const name=e.module||(e.path.startsWith('source/')?e.path.slice(7,-4).replaceAll('/','.'):e.path.startsWith('config/')?'fixture.'+e.path.split('/').at(-1).slice(0,-4):null);
  if(name)sources[name]=b.toString('utf8');
 }
 sources['fixture.actionPlatform']=readFileSync(here('dfq-action-platform.lua'),'utf8');
 return {sources,platform:readFileSync(here('dfq-platform.lua'),'utf8'),fixture:readFileSync(here('dfq-action-fixture.lua'),'utf8'),lock:{repository:base.repository,commit:base.commit,files:[...base.files,...action.files]}};
}
