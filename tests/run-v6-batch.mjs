/** Independent build/Node/browser checks; one failure never skips the others. */
import {spawnSync} from 'node:child_process';
import {mkdirSync,readdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const output=fileURLToPath(new URL('../docs/evidence-v6/',import.meta.url));
mkdirSync(output,{recursive:true});
const cases=[['build',['prototype/build-duel-lab.mjs']],
  ['node',['--test',...readdirSync(new URL('./',import.meta.url)).filter(f=>f.endsWith('.test.mjs')).sort().map(f=>'tests/'+f)]],
  ['browser',['tests/duel-lab-smoke.cjs']]];
const results=[];
for(const [name,args] of cases){
  const run=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',timeout:120000});
  const log=(run.stdout??'')+(run.stderr??'')+(run.error?'\n'+run.error.message:'');
  writeFileSync(output+name+'.txt',log);
  const blocked=name==='browser'&&/Executable doesn't exist|Cannot find module/.test(log);
  const item={name,command:'node '+args.join(' '),exitCode:run.status,status:run.status===0?'PASS':blocked?'ENVIRONMENT_BLOCKED':'FAIL',log:name+'.txt'};
  results.push(item);console.log(JSON.stringify(item));
}
writeFileSync(output+'results.json',JSON.stringify({executedAt:new Date().toISOString(),node:process.version,results},null,2)+'\n');
process.exitCode=results.every(r=>r.status==='PASS')?0:1;
