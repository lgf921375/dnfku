from pathlib import Path
import subprocess,json,tempfile,re,os
from urllib.parse import urlsplit,urlunsplit
from concurrent.futures import ThreadPoolExecutor
out=Path('/workspace/scratch/ad0ba23151c8/dnfku/docs/evidence-download-20261012')
urls={}
text=(out/'dry-run.txt').read_text()
current=None
for line in text.splitlines():
 if line.startswith('Chrome for Testing '):current='chromium'
 elif line.startswith('Chrome Headless Shell '):current='headless-shell'
 elif line and not line.startswith(' '):current=None
 if current and 'Download url:' in line:urls[current]=line.split('Download url:',1)[1].strip()
assert len(urls)==2

def safeurl(u):
 p=urlsplit(u);return urlunsplit((p.scheme,(p.hostname or '')+(':'+str(p.port) if p.port else ''),p.path,'<redacted>' if p.query else '', ''))
def sanitize(s):return re.sub(r'https?://[^\s]+',lambda m:safeurl(m.group()),s)
def request(item):
 name,url,kind=item
 with tempfile.TemporaryDirectory(prefix='pw-response-') as d:
  body=Path(d)/'body'
  cmd=['curl','-q','-sS','--location','--max-redirs','5','--connect-timeout','8','--max-time','20','--proto','=https','--proto-redir','=https']
  if kind=='HEAD':cmd+=['--head']
  else:cmd+=['--range','0-4095','--max-filesize','8192']
  cmd+=['--dump-header','-','--output',str(body),'--write-out','\nDIAG_JSON:{"http_code":"%{http_code}","url_effective":"%{url_effective}","size_download":%{size_download},"num_redirects":%{num_redirects}}',url]
  r=subprocess.run(cmd,capture_output=True,text=True)
  raw=r.stdout;headers=[]
  allow={'content-type','content-length','content-range','location','server','via','x-cache','accept-ranges','x-mitmproxy-blocked-reason'}
  for line in raw.splitlines():
   if line.startswith('HTTP/'):headers.append(line)
   elif ':' in line and line.split(':',1)[0].lower() in allow:
    k,v=line.split(':',1);headers.append(k+': '+(safeurl(v.strip()) if k.lower()=='location' else v.strip()))
  match=re.search(r'DIAG_JSON:(\{.*\})',raw)
  summary=json.loads(match.group(1)) if match else {};summary['url_effective']=safeurl(summary.get('url_effective',url))
  b=body.read_bytes() if body.exists() else b''
  result={'target':name,'method':kind,'url':safeurl(url),'curl_exit_code':r.returncode,'headers':headers,'summary':summary,'response_file_bytes':len(b),'entity_body_bytes':0 if kind=='HEAD' else len(b),'output_file_content':'HEAD headers only' if kind=='HEAD' else 'entity body','first_16_bytes_hex':None if kind=='HEAD' else b[:16].hex(),'zip_local_header':None if kind=='HEAD' else b[:4]==b'PK\x03\x04','stderr':sanitize(r.stderr),'request_limits':{'range':'0-4095' if kind!='HEAD' else None,'max_filesize':8192 if kind!='HEAD' else None,'max_time':20},'proxy_environment_preserved':True}
  (out/(name+'-'+kind.lower()+'.json')).write_text(json.dumps(result,indent=2))
  return result
jobs=[(n,u,k) for n,u in urls.items() for k in ['HEAD','RANGE']]
with ThreadPoolExecutor(max_workers=4) as ex:
 results=list(ex.map(request,jobs))
(out/'response-results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
