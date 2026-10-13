// Local-only runner. Explicit project authorization may allow browser sandbox disabled.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const crypto=require('node:crypto'),{spawn,execFileSync}=require('node:child_process');
const {runJuggleAcceptance}=require('./juggle-lab-acceptance.cjs');
const {runSummonerAcceptance}=require('./summoner-lab-acceptance.cjs');
const {runSummonerMobileAcceptance}=require('./summoner-mobile-acceptance.cjs');
const {runSummonerFeedbackAcceptance}=require('./summoner-feedback-acceptance.cjs');
const {runSummonerVictimAcceptance}=require('./summoner-victim-acceptance.cjs');
const {runSummonerVictimS5Acceptance}=require('./summoner-victim-s5-acceptance.cjs');
const {runSummonerVictimS6Acceptance}=require('./summoner-victim-s6-acceptance.cjs');
const {runSummonerContactS7Acceptance}=require('./summoner-contact-s7-acceptance.cjs');
const root=path.resolve(__dirname,'..');
const summonerOnly=process.env.DNFKU_LOCAL_SUITE==='summoner';
const summonerVersion=process.env.DNFKU_SUMMONER_CANDIDATE==='s8'?'S8':process.env.DNFKU_SUMMONER_CANDIDATE==='s7'?'S7':process.env.DNFKU_SUMMONER_CANDIDATE==='s6'?'S6':process.env.DNFKU_SUMMONER_CANDIDATE==='s5'?'S5':process.env.DNFKU_SUMMONER_CANDIDATE==='s4'?'S4':process.env.DNFKU_SUMMONER_CANDIDATE==='s3'?'S3':process.env.DNFKU_SUMMONER_CANDIDATE==='s2'?'S2':'S1';
const summonerPage='/summoner-lab-'+summonerVersion.toLowerCase()+'.html';
const defaultGrant=path.join(root,'docs/local-testing-authorization.json');
const authorizationPath=process.env.DNFKU_LOCAL_AUTHORIZATION_RECORD??(fs.existsSync(defaultGrant)?defaultGrant:undefined);
const authorizedLocal=!!authorizationPath;
const authorizationNonce=process.env.DNFKU_LOCAL_AUTHORIZATION_NONCE??crypto.randomUUID();
function authorization(){
  if(!authorizedLocal)return null;
  const record=JSON.parse(fs.readFileSync(authorizationPath));
  const once=record.scope==='current-isolated-Work-loopback-only'&&record.runs===1&&record.userResponse==='授权';
  const persistent=record.scope==='isolated-Work-local-loopback-only'&&record.runs==='ongoing'&&record.userResponse==='永久授权本地测试'&&record.policy==='persistent-local-only'&&record.project==='lgf921375/dnfku';
  if(record.browserSandbox!==false||(!once&&!persistent))throw Error('Invalid explicit local authorization record');
  return record;
}
const dir=path.resolve(process.env.DNFKU_EVIDENCE_DIR??path.join(root,'local-evidence/v11-'+Date.now()));
fs.mkdirSync(dir,{recursive:true});
const persistentAuthorization=authorization()?.policy==='persistent-local-only';
const runClaimPath=persistentAuthorization?path.join(dir,'authorization-use.json'):authorizationPath+'.used';
const write=(name,data)=>fs.writeFileSync(path.join(dir,name),JSON.stringify(data,null,2)+'\n');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function playwright(){return require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');}
function environment(){
  const result={utc:new Date().toISOString(),localShanghai:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'}),cwd:process.cwd(),uid:process.getuid?.(),gid:process.getgid?.(),node:process.version,platform:process.platform,arch:process.arch,sandboxRequested:!authorizedLocal,browserLaunch:'NOT RUN',actualSandbox:'NOT COVERED',authorization:authorization()};
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
  const result={status:'failed-or-blocked',sandboxRequested:!authorizedLocal,actualSandbox:'NOT COVERED',checks:[],errors:[],consoleErrors:[],requestFailures:[],cases:{},videos:[],androidHandFeel:'NOT COVERED',visualSimilarity:'NOT COVERED'};
  let recording=null;
  async function startRecording(label){
    await page.getByRole('button',{name:'录制战斗',exact:true}).click();
    await page.getByRole('button',{name:'停止并下载',exact:true}).waitFor({state:'visible',timeout:5000});recording=label;
  }
  async function stopRecording(){
    if(!recording)return;
    const label=recording;recording=null;
    const promise=page.waitForEvent('download',{timeout:5000});
    await page.getByRole('button',{name:'停止并下载',exact:true}).click();
    const download=await promise,file=path.join(dir,label+'-browser-canvas.webm');await download.saveAs(file);
    result.videos.push({file:path.basename(file),source:'real browser Canvas.captureStream + UI MediaRecorder; excludes DOM controls/audio',bytes:fs.statSync(file).size,sha256:sha(fs.readFileSync(file))});
  }
  process.once('SIGTERM',()=>{
    result.timeoutSignal='SIGTERM';process.exitCode=124;
    if(browser)browser.close().catch(e=>{result.signalCleanupError=e.message;});
    else {write('results.json',{...result,status:'failed-timeout',exitCode:124});process.exit(124);}
  });
  try{
    if(process.getuid?.()===0&&!authorizedLocal)throw Error('Root browser execution is not allowed');
    if(process.env.GITHUB_ACTIONS||process.env.RUNNER_ENVIRONMENT)throw Error('Use the CI wrapper in CI; local runner must not impersonate CI');
    const env=environment();if(!env.versionMatched)throw Error('Installed Shell does not match the installed Playwright manifest');
    if(authorizedLocal){
      const claim=JSON.parse(fs.readFileSync(runClaimPath));
      if(claim.nonce!==authorizationNonce)throw Error('Authorization is not assigned to this worker');
      result.authorization=env.authorization;
    }
    const pages=new Map(['/juggle-lab-v11.html','/feedback-lab-v10.html','/summoner-lab-s1.html','/summoner-lab-s2.html','/summoner-lab-s3.html','/summoner-lab-s4.html','/summoner-lab-s5.html','/summoner-lab-s6.html','/summoner-lab-s7.html','/summoner-lab-s8.html'].map(url=>[url,fs.readFileSync(path.join(root,'prototype',url.slice(1)))]));
    server=http.createServer((req,res)=>{const bytes=pages.get(req.url);if(!bytes){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Length':bytes.length,'Cache-Control':'no-store'});res.end(bytes);});
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
    result.binding=server.address();const origin=`http://127.0.0.1:${result.binding.port}`;
    browser=await chromium.launch({executablePath:env.executable,headless:true,chromiumSandbox:!authorizedLocal,timeout:15000,args:['--renderer-process-limit=2']});
    result.browserVersion=browser.version();if(result.browserVersion!==env.expectedShell.browserVersion)throw Error('Launched browser version mismatch');
    result.actualSandbox=authorizedLocal?(persistentAuthorization?'Chromium沙箱已关闭；用户长期授权隔离Work本地测试':'Chromium沙箱已关闭；用户仅授权当前隔离Work本地一次验收'):'Launch succeeded with chromiumSandbox:true; sandbox internals not separately audited';
    // Reuse the page's real recording button, without installing or impersonating
    // Playwright's missing FFmpeg cache. Canvas-only scope is recorded explicitly.
    context=await browser.newContext({viewport:{width:960,height:540},hasTouch:true,acceptDownloads:true});
    await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort('blockedbyclient'));
    page=await context.newPage();page.setDefaultTimeout(12000);page.setDefaultNavigationTimeout(15000);
    page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')result.consoleErrors.push(m.text());});page.on('requestfailed',r=>result.requestFailures.push({url:r.url().split('?')[0],error:r.failure()?.errorText}));
    // Default suite preserves both historical baselines. A declared S1-only run
    // supports diagnostics without pretending that skipped baselines ran again.
    if(!summonerOnly){
    result.v10={assertions:0,status:'running'};
    await page.goto(origin+'/feedback-lab-v10.html',{waitUntil:'load'});
    await startRecording('v10');
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
    await stopRecording();
    await runJuggleAcceptance({page,dir,url:origin+'/juggle-lab-v11.html',exactHtml:path.join(root,'prototype/juggle-lab-v11.html'),transport:'loopback HTTP',result,onPageLoaded:()=>startRecording('v11'),onProgress:name=>{write('status.json',{phase:'browser-case',case:name,utc:new Date().toISOString()});write('results.json',result);}});
    await stopRecording();
    }else result.baselines='NOT RUN: explicit DNFKU_LOCAL_SUITE=summoner';
    await runSummonerAcceptance({page,dir,url:origin+summonerPage,exactHtml:path.join(root,'prototype',summonerPage.slice(1)),result,version:summonerVersion,liftedPose:summonerVersion!=='S1',onPageLoaded:async()=>{
      if(['S3','S4','S5','S6','S7','S8'].includes(summonerVersion))await page.locator('#empty').check();
      await page.getByRole('button',{name:'录制动作',exact:true}).click();
      await page.getByRole('button',{name:'停止并下载',exact:true}).waitFor({state:'visible',timeout:5000});recording='summoner-'+summonerVersion.toLowerCase();
    }});
    if(['S3','S4','S5','S6','S7','S8'].includes(summonerVersion)){
      await runSummonerFeedbackAcceptance({page,dir,result});
      if(result.feedback.status!=='passed-feedback-browser')throw Error('S3 feedback browser acceptance failed; see feedback-results.json');
    }
    if(summonerVersion==='S4'){
      await runSummonerVictimAcceptance({page,dir,result});
      if(result.victim.status!=='passed-victim-browser')throw Error('S4 victim acceptance failed; see victim-results.json');
    }
    if(summonerVersion==='S5'){
      await runSummonerVictimS5Acceptance({page,dir,result});
      if(result.victim.status!=='passed-victim-browser')throw Error('S5 victim acceptance failed; see victim-results.json');
    }
    if(summonerVersion==='S6'){
      await runSummonerVictimS6Acceptance({page,dir,result});
      if(result.victim.status!=='passed-victim-browser')throw Error('S6 victim acceptance failed; see victim-results.json');
    }
    if(['S7','S8'].includes(summonerVersion)){
      await runSummonerContactS7Acceptance({page,dir,result});
      if(result.victim.status!=='passed-victim-browser')throw Error('S7 contact acceptance failed; see victim-results.json');
    }
    if(summonerVersion==='S8'){
      await require('./summoner-comparison-s8-acceptance.cjs').runSummonerComparisonS8Acceptance({page,dir,result});
      if(result.comparison.status!=='passed-comparison-browser')throw Error('S8 comparison acceptance failed; see comparison-results.json');
    }
    if(process.env.DNFKU_TEST_MOBILE==='1'){
      await stopRecording();
      // Mobile navigation destroys the recorder. Screenshots stay local for
      // internal visual inspection; the tested desktop Canvas video is retained.
      await runSummonerMobileAcceptance({page,dir,url:origin+summonerPage,result});
      if(result.mobile.status!=='passed-mobile-viewport')throw Error('Mobile-size touch/layout acceptance failed; see mobile-results.json');
    }
    result.status='passed-browser';
  }catch(e){result.error=e.stack;process.exitCode=1;if(page)try{await page.mouse.up();
    if(result.summoner)result.summoner.failureState=await page.evaluate(()=>({snapshot:summonerLab.motion.snapshot(),events:summonerLab.motion.events,samples:summonerLab.samples.slice(-120),fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),focused:document.activeElement?.outerHTML}));
    await page.screenshot({fullPage:true,path:path.join(dir,'failure.png')});}catch(capture){result.captureError=capture.stack;}}
  finally{if(page&&recording)try{await stopRecording();}catch(e){result.recordingError=e.stack;process.exitCode=1;}
    for(const [name,resource] of [['context',context],['browser',browser]])if(resource)try{await resource.close();}catch(e){result[name+'CleanupError']=e.stack;process.exitCode=1;}
    if(server)await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
    result.exitCode=process.exitCode??0;if(result.timeoutSignal)result.status='failed-timeout';else if(result.exitCode&&result.status==='passed-browser')result.status='failed-cleanup';write('results.json',result);
  }
}
function parent(){
  const started=Date.now();let env;
  if(persistentAuthorization&&fs.existsSync(runClaimPath)){console.error('Evidence directory already used; choose a fresh run directory');process.exitCode=2;return;}
  try{
    env=environment();write('environment.json',env);
    if(env.uid===0&&!authorizedLocal)throw Error('BLOCKED: UID 0; use an ordinary-user execution environment. No browser/server launched.');
    if(process.env.GITHUB_ACTIONS||process.env.RUNNER_ENVIRONMENT)throw Error('Local execution must not impersonate CI');
    if(!env.versionMatched)throw Error('Supply a matched DNFKU_CHROME_EXECUTABLE Headless Shell path');
    if(authorizedLocal)fs.writeFileSync(runClaimPath,JSON.stringify({status:'claimed',nonce:authorizationNonce,parentPid:process.pid,utc:new Date().toISOString()}),{flag:'wx'});
  }catch(e){write('results.json',{status:'blocked-environment',error:e.message,checks:[],browserAssertions:0,exitCode:2,elapsedMs:Date.now()-started,sandboxRequested:!authorizedLocal,actualSandbox:'NOT COVERED',environment:env});write('status.json',{phase:'blocked',exitCode:2});fs.writeFileSync(path.join(dir,'exit-code.txt'),'2\n');console.error(e.message);process.exitCode=2;return;}
  const log=fs.openSync(path.join(dir,'browser.log'),'w');
  const child=spawn(process.execPath,['--max-old-space-size=384',__filename,'--worker'],{cwd:root,env:{...process.env,DNFKU_EVIDENCE_DIR:dir,DNFKU_LOCAL_AUTHORIZATION_NONCE:authorizationNonce},detached:process.platform==='linux',stdio:['ignore',log,log]});
  if(authorizedLocal)fs.writeFileSync(runClaimPath,JSON.stringify({status:'worker-assigned',nonce:authorizationNonce,parentPid:process.pid,childPid:child.pid,utc:new Date().toISOString()}));
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
    if(timedOut||!fs.existsSync(path.join(dir,'results.json'))){
      let partial={checks:[]};try{partial=JSON.parse(fs.readFileSync(path.join(dir,'results.json')));}catch{}
      write('results.json',{...partial,previousStatus:partial.status,status:timedOut?'failed-timeout':'blocked-environment',exitCode});
    }
    console.log(JSON.stringify({exitCode,timedOut,evidence:dir}));process.exitCode=exitCode;
  });
}
if(process.argv.includes('--worker'))worker();else parent();
