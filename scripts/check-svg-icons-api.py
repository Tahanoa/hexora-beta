"""Live local integration: SVG catalog, validation, authorization, persistence and cleanup."""
import os,json,uuid
from urllib.request import Request,urlopen
from urllib.error import HTTPError
base=os.environ.get('HEXORA_TEST_BASE_URL','http://127.0.0.1:8080')
def call(method,path,body=None,token=None,kind='application/json',expected=200):
 if isinstance(body,dict):body=json.dumps(body).encode()
 headers={'Content-Type':kind}
 if token:headers['Authorization']='Bearer '+token
 try:
  with urlopen(Request(base+path,body,headers,method=method),timeout=20) as r:status=r.status;raw=r.read();meta=r.headers
 except HTTPError as e:status=e.code;raw=e.read();meta=e.headers
 assert status==expected,(path,status,raw[:200])
 return (json.loads(raw).get('data',json.loads(raw)) if raw.startswith(b'{') else raw),meta
admin=call('POST','/api/auth/login',{'usernameOrEmail':os.environ['ADMIN_USERNAME'],'password':os.environ['ADMIN_PASSWORD']})[0]['accessToken']
suffix=uuid.uuid4().hex[:8];created=[];skill=None
safe=b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><linearGradient id="g"><stop stop-color="#00c26e"/></linearGradient></defs><path d="M2 2h20v20H2z" fill="url(#g)"/></svg>'
def upload(svg,name='custom.svg',token=admin,expected=201):
 boundary='hexora'+suffix
 body=f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{name}"\r\nContent-Type: image/svg+xml\r\n\r\n'.encode()+svg+f'\r\n--{boundary}--\r\n'.encode()
 return call('POST','/api/media/icons',body,token,'multipart/form-data; boundary='+boundary,expected)[0]
try:
 call('GET','/api/media/icons',expected=401)
 upload(safe,token=None,expected=401)
 for source in [b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',b'<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>',b'<svg xmlns="http://www.w3.org/2000/svg"><foreignObject/></svg>',b'<svg xmlns="http://www.w3.org/2000/svg"><use href="https://example.com/x.svg#x"/></svg>',b'<!DOCTYPE svg [<!ENTITY x SYSTEM "file:///etc/passwd">]><svg xmlns="http://www.w3.org/2000/svg"><title>&x;</title></svg>',b'<svg xmlns="http://www.w3.org/2000/svg"><path style="fill:url(https://example.com/x)"/></svg>',b'not an svg',b'x'*(256*1024+1)]:upload(source,expected=400)
 upload(safe,name='fake.png',expected=400)
 for _ in range(2):created.append(upload(safe,name='named-icon-'+suffix+'.svg'))
 assert created[0]['id']!=created[1]['id'],'same name must not overwrite an existing icon'
 for media in created:
  assert media['fileName']=='named-icon-'+suffix+'.svg';assert media['contentType']=='image/svg+xml'
  raw,headers=call('GET',media['url']);assert b'linearGradient' in raw;assert headers['Content-Type'].startswith('image/svg+xml');assert 'sandbox' in headers['Content-Security-Policy'];assert headers['X-Content-Type-Options']=='nosniff'
 catalog=call('GET','/api/media/icons',token=admin)[0];assert all(any(x['id']==m['id'] for x in catalog) for m in created)
 skill=call('POST','/api/skills',{'name':'SVG test '+suffix,'category':'OTHER','level':50,'icon':created[0]['url']},admin,expected=201)[0]
 assert any(x['id']==skill['id'] and x['icon']==created[0]['url'] for x in call('GET','/api/skills/public')[0])
 print('PASS: admin-only upload/catalog, malicious/invalid/oversized SVG rejection, gradients and internal refs, original filename, duplicate-name isolation, public MIME/CSP, persisted catalog and saved skill reference.')
finally:
 if skill:call('DELETE','/api/skills/'+str(skill['id']),token=admin,expected=204)
 for media in created:call('DELETE','/api/media/'+str(media['id']),token=admin,expected=204)
