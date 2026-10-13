// Local-only, sandbox-required runner. No CI identity spoofing or user switching.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const crypto=require('node:crypto'),{spawn,execFileSync}=require('node:child_process');
const {runJuggleAcceptance}=require('./juggle-lab-acceptance.cjs');
const root=path.resolve(__dirname,'..');
const dir=path.resolve(process.env.DNFKU_EVIDENCE_DIR??path.join(root,'local-evidence/v11'));
fs.mkdirSync(dir,{recursive:true});
const write=(name,data)=>fs.writeFileSync(path.join(dir,name),JSON.stringify(data,null,2)+'\n');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function playwright(){return require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');}
function environment(){
  const result={utc:new Date().toISOString(),localShanghai:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'}),cwd:process.cwd(),uid:process.getuid?.(),gid:process.getgid?.(),node:process.version,platform:process.platform,arch:process.arch,sandboxRequested:true,browserLaunch:'NOT RUN',actualSandbox:'NOT COVERED'};
  try{result.commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',timeout:5000}).trim();result.branch=execFileSync('git',['branch','--show-current'],{cwd:root,encoding:'utf8',timeout:5000}).trim();}catch(e){result.gitError=e.message;}
  const modules=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
  const pwPackage=modules?path.join(modules,'playwright/package.json'):require.resolve('playwright/package.json');
  const corePackage=modules?path.join(modules,'playwright-core/package.json'):require.resolve('playwright-core/package.json');
  result.playwrightVersion=JSON.parse(fs.readFileSync(pwPackage)).version;
  const manifest=JSON.parse(fs.readFileSync(path.join(path.dirname(corePackage),'browsers.json')));
  result.expectedShell=manifest.browsers.find(b=>b.name==='chromium-headless-shell');
  result.executable=process.env.DNFKU_CHROME_EXECUTABLE;
  const html=path.join(root,'prototype/juggle-lab-v11.html');result.htmlSHA256=sha(fs.readFileSync(html));
  if(result.executable){
    if(!path.isAbsolute(result.executable))throw Error('Use an absolute Headless Shell path');
    fs.accessSync(result.executable,fs.constants.X_OK);
    result.executableSHA256=sha(fs.readFileSync(result.executable));
    result.shellVersion=execFileSync(result.executable,['--version'],{encoding:'utf8',timeout:5000}).trim();
    result.versionMatched=result.shellVersion.includes(result.expectedShell.browserVersion);
  }
  return result;
}
async function worker(){
  const {chromium}=playwright();let browser,context,page,server;
  const result={status:'failed-or-blocked',sandboxRequested:true,actualSandbox:'NOT COVERED',checks:[],errors:[],consoleErrors:[],requestFailures:[],cases:{},androidHandFeel:'NOT COVERED',visualSimilarity:'NOT COVERED'};
  process.once('SIGTERM',()=>{
    result.timeoutSignal='SIGTERM';process.exitCode=124;
    if(browser)browser.close().catch(e=>{result.signalCleanupError=e.message;});
    else {write('results.json',{...result,status:'failed-timeout',exitCode:124});process.exit(124);}
  });
  try{
    if(process.getuid?.()===0)throw Error('Root browser execution is not allowed');
    if(process.env.GITHUB_ACTIONS||process.env.RUNNER_ENVIRONMENT)throw Error('Use the CI wrapper in CI; local runner must not impersonate CI');
    const env=environment();if(!env.versionMatched)throw Error('Installed Shell does not match the installed Playwright manifest');
    const pages=new Map(['/juggle-lab-v11.html','/feedback-lab-v10.html'].map(url=>[url,fs.readFileSync(path.join(root,'prototype',url.slice(1)))]));
    server=http.createServer((req,res)=>{const bytes=pages.get(req.url);if(!bytes){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Length':bytes.length,'Cache-Control':'no-store'});res.end(bytes);});
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
    result.binding=server.address();const origin=`http://127.0.0.1:${result.binding.port}`;
    browser=await chromium.launch({executablePath:env.executable,headless:true,chromiumSandbox:true,timeout:15000,args:['--renderer-process-limit=2']});
    result.browserVersion=browser.version();if(result.browserVersion!==env.expectedShell.browserVersion)throw Error('Launched browser version mismatch');
    result.actualSandbox='Launch succeeded with chromiumSandbox:true; sandbox internals not separately audited';
    context=await browser.newContext({viewport:{width:960,height:540},hasTouch:true,recordVideo:{dir,size:{width:960,height:540}}});
    await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort('blockedbyclient'));
    page=await context.newPage();page.setDefaultTimeout(12000);page.setDefaultNavigationTimeout(15000);
    page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')result.consoleErrors.push(m.text());});page.on('requestfailed',r=>result.requestFailures.push({url:r.url().split('?')[0],error:r.failure()?.errorText}));
    // Local baseline preserves the exact five V10 checks; its CI file stays untouched.
    result.v10={assertions:0,status:'running'};
    await page.goto(origin+'/feedback-lab-v10.html',{waitUntil:'load'});
    if(!(await page.title()).includes('V10'))throw Error('Preview is not V10');result.v10.assertions++;
    await page.getByRole('button',{name:'重来',exact:true}).click();
    await page.keyboard.down('d');await page.waitForTimeout(150);await page.keyboard.up('d');
    await page.getByRole('button',{name:'攻击',exact:true}).click();
    await page.waitForFunction(()=>window.rhythmLab.game.events.some(e=>e.type==='damage'),null,{timeout:3000});result.v10.assertions++;
    await page.screenshot({path:path.join(dir,'v10-manual-hit.png')});
    await page.getByRole('button',{name:'重来',exact:true}).click();await page.getByRole('button',{name:'连招演示',exact:true}).click();
    await page.waitForFunction(()=>window.rhythmLab.demo?.done,null,{timeout:15000});
    const baseline=await page.evaluate(()=>({phase:rhythmLab.demo.phase,events:rhythmLab.game.events,bodyEvents:rhythmLab.game.fighter('B').body.events}));
    if(baseline.phase!=='保护起身')throw Error('Demo did not reach protection');result.v10.assertions++;
    if(!baseline.events.some(e=>e.reaction==='air')||!baseline.events.some(e=>e.reaction==='ground'))throw Error('Air/down chase absent');result.v10.assertions++;
    if(result.errors.length)throw Error(result.errors.join('\n'));result.v10.assertions++;
    result.v10.status='passed-browser';result.v10.result=baseline;
    await page.screenshot({path:path.join(dir,'v10-protection.png')});
    await runJuggleAcceptance({page,dir,url:origin+'/juggle-lab-v11.html',exactHtml:path.join(root,'prototype/juggle-lab-v11.html'),transport:'loopback HTTP',result,onProgress:name=>{write('status.json',{phase:'browser-case',case:name,utc:new Date().toISOString()});write('results.json',result);}});
    result.status='passed-browser';
  }catch(e){result.error=e.stack;process.exitCode=1;if(page)try{await page.mouse.up();await page.screenshot({path:path.join(dir,'failure.png')});}catch(capture){result.captureError=capture.stack;}}
  finally{for(const [name,resource] of [['context',context],['browser',browser]])if(resource)try{await resource.close();}catch(e){result[name+'CleanupError']=e.stack;process.exitCode=1;}
    if(server)await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
    result.exitCode=process.exitCode??0;if(result.timeoutSignal)result.status='failed-timeout';else if(result.exitCode&&result.status==='passed-browser')result.status='failed-cleanup';write('results.json',result);
  }
}
function parent(){
  const started=Date.now();let env;
  try{
    env=environment();write('environment.json',env);
    if(env.uid===0)throw Error('BLOCKED: UID 0; use an ordinary-user execution environment. No browser/server launched.');
    if(process.env.GITHUB_ACTIONS||process.env.RUNNER_ENVIRONMENT)throw Error('Local execution must not impersonate CI');
    if(!env.versionMatched)throw Error('Supply a matched DNFKU_CHROME_EXECUTABLE Headless Shell path');
  }catch(e){write('results.json',{status:'blocked-environment',error:e.message,checks:[],browserAssertions:0,exitCode:2,elapsedMs:Date.now()-started,sandboxRequested:true,actualSandbox:'NOT COVERED',environment:env});write('status.json',{phase:'blocked',exitCode:2});fs.writeFileSync(path.join(dir,'exit-code.txt'),'2\n');console.error(e.message);process.exitCode=2;return;}
  const log=fs.openSync(path.join(dir,'browser.log'),'w');
  const child=spawn(process.execPath,['--max-old-space-size=384',__filename,'--worker'],{cwd:root,env:{...process.env,DNFKU_EVIDENCE_DIR:dir},detached:process.platform==='linux',stdio:['ignore',log,log]});
  fs.closeSync(log);write('status.json',{phase:'running',pid:child.pid,utc:new Date().toISOString(),timeoutMs:90000});
  let timedOut=false,killTimer;
  const signal=s=>{try{process.kill(process.platform==='linux'?-child.pid:child.pid,s);}catch(e){if(e.code!=='ESRCH')throw e;}};
  // Playwright browser children can have their own process group. Capture only this
  // worker's descendants so a hard timeout never kills an unrelated browser/task.
  function descendants(){
    if(process.platform!=='linux')return [];
    const parents=new Map(),starts=new Map();for(const pid of fs.readdirSync('/proc').filter(n=>/^\d+$/.test(n)))try{
      const stat=fs.readFileSync(`/proc/${pid}/stat`,'utf8').split(') ').at(-1).split(' ');parents.set(Number(pid),Number(stat[1]));starts.set(Number(pid),stat[19]);
    }catch{}
    const own=new Set([child.pid]);let changed=true;while(changed){changed=false;for(const [pid,parent] of parents)if(own.has(parent)&&!own.has(pid)){own.add(pid);changed=true;}}
    return [...own].filter(pid=>pid!==child.pid).map(pid=>({pid,start:starts.get(pid)}));
  }
  function killOwned(list){for(const {pid,start} of list)try{
    const current=fs.readFileSync(`/proc/${pid}/stat`,'utf8').split(') ').at(-1).split(' ')[19];
    if(current===start)process.kill(pid,'SIGKILL');
  }catch(e){if(!['ESRCH','ENOENT'].includes(e.code))throw e;}}
  let timeoutDescendants=[];
  const timeout=setTimeout(()=>{timedOut=true;timeoutDescendants=descendants();write('status.json',{phase:'timed-out',pid:child.pid,ownedDescendants:timeoutDescendants});signal('SIGTERM');killTimer=setTimeout(()=>{
    killOwned(timeoutDescendants);
    signal('SIGKILL');
  },3000);},90000);
  child.on('error',e=>{write('results.json',{status:'blocked-environment',error:e.message,checks:[],exitCode:2});});
  child.on('close',(code,signalName)=>{clearTimeout(timeout);clearTimeout(killTimer);const exitCode=timedOut?124:code??2;
    if(timedOut)killOwned(timeoutDescendants);
    write('status.json',{phase:timedOut?'timed-out':'completed',exitCode,signal:signalName,elapsedMs:Date.now()-started});fs.writeFileSync(path.join(dir,'exit-code.txt'),exitCode+'\n');
    if(timedOut||!fs.existsSync(path.join(dir,'results.json')))write('results.json',{status:timedOut?'failed-timeout':'blocked-environment',checks:[],exitCode});
    console.log(JSON.stringify({exitCode,timedOut,evidence:dir}));process.exitCode=exitCode;
  });
}
if(process.argv.includes('--worker'))worker();else parent();
