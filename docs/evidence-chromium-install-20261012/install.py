import pathlib,subprocess,json,hashlib,zipfile,stat,time,concurrent.futures
base=pathlib.Path('/tmp/dnfku-cft-151.0.7922.34-20261012');base.mkdir(exist_ok=False)
ev=pathlib.Path('/workspace/scratch/ad0ba23151c8/chromium-test-20261012/evidence')
items=[('chrome','chrome-linux64.zip',193282658,'chrome-linux64/chrome'),('shell','chrome-headless-shell-linux64.zip',120231126,'chrome-headless-shell-linux64/chrome-headless-shell')]
def work(item):
 name,file,expected,exe=item; url='https://storage.googleapis.com/chrome-for-testing-public/151.0.7922.34/linux64/'+file
 dst=base/file; log={'name':name,'url':url,'expected_size':expected,'archive_path':str(dst),'started_utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
 try:
  cmd=['curl','-q','-sS','--fail','--location','--max-redirs','5','--connect-timeout','15','--max-time','360','--proto','=https','--proto-redir','=https','--output',str(dst),'--write-out','%{json}',url]
  log['command']=cmd;p=subprocess.run(cmd,capture_output=True,text=True);log['download_exit_code']=p.returncode;log['stderr']=p.stderr
  try:
   meta=json.loads(p.stdout);log['http']={k:meta.get(k) for k in ['http_code','content_type','size_download','num_redirects','time_total','url_effective']}
  except Exception:log['curl_stdout']=p.stdout
  log['actual_size']=dst.stat().st_size if dst.exists() else 0
  if p.returncode:raise RuntimeError('curl download failed')
  if log['actual_size']!=expected:raise RuntimeError('resource size mismatch')
  h=hashlib.sha256()
  with dst.open('rb') as f:
   for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
  log['sha256']=h.hexdigest()
  with zipfile.ZipFile(dst) as z:
   entries=z.infolist();log['entries']=len(entries)
   for e in entries:
    pth=pathlib.PurePosixPath(e.filename);mode=e.external_attr>>16
    if pth.is_absolute() or '..' in pth.parts or '\\' in e.filename or stat.S_ISLNK(mode):raise RuntimeError('unsafe ZIP entry: '+e.filename)
    if mode and stat.S_IFMT(mode) not in [0,stat.S_IFREG,stat.S_IFDIR]:raise RuntimeError('unsupported ZIP entry type')
   bad=z.testzip();log['crc_bad_entry']=bad
   if bad:raise RuntimeError('CRC failed')
   log['all_entries_crc']='passed'
   target=base/name;target.mkdir()
   for e in entries:
    out=target/e.filename
    if e.is_dir():out.mkdir(parents=True,exist_ok=True);continue
    out.parent.mkdir(parents=True,exist_ok=True)
    with z.open(e) as src,out.open('xb') as dest:
     while True:
      b=src.read(1024*1024)
      if not b:break
      dest.write(b)
    out.chmod(0o755 if (e.external_attr>>16)&0o111 else 0o644)
  executable=target/exe;log['executable']=str(executable);log['executable_exists']=executable.is_file();log['status']='installed' if executable.is_file() else 'failed'
 except Exception as e:log['status']='failed';log['error']=str(e)
 log['finished_utc']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());(ev/(name+'-install.json')).write_text(json.dumps(log,indent=2));print(json.dumps(log),flush=True)
 return log
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(work,items))
(ev/'installation-results.json').write_text(json.dumps(results,indent=2))
