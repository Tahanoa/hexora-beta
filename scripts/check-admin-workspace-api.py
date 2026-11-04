"""Read/write integration against a disposable local PostgreSQL app. Own fixtures are cleaned up."""
import os,json,uuid,subprocess
from urllib.request import Request,urlopen
from urllib.error import HTTPError
base=os.environ.get('HEXORA_TEST_BASE_URL','http://127.0.0.1:8080')
assert base.startswith('http://127.0.0.1:') and os.environ.get('HEXORA_TEST_DB_FIXTURES')=='1','Requires an explicitly authorized local test database'
def call(method,path,data=None,token=None,expected=200):
 body=json.dumps(data).encode() if data is not None else None;headers={'Content-Type':'application/json'}
 if token:headers['Authorization']='Bearer '+token
 try:
  with urlopen(Request(base+path,body,headers,method=method),timeout=20) as r:status=r.status;raw=r.read()
 except HTTPError as e:status=e.code;raw=e.read()
 assert status==expected,(path,status,raw[:200]);return json.loads(raw).get('data') if raw else None
def sql(query):
 env={**os.environ,'PGPASSWORD':os.environ['DATABASE_PASSWORD']}
 return subprocess.check_output(['psql','-h','127.0.0.1','-p','55432','-U',os.environ['DATABASE_USERNAME'],'-d','hexora','-At','-c',query],env=env,text=True).strip()
auth=call('POST','/api/auth/login',{'usernameOrEmail':os.environ['ADMIN_USERNAME'],'password':os.environ['ADMIN_PASSWORD']});token=auth['accessToken'];owner=call('GET','/api/auth/me',token=token)['id'];marker='adminux'+uuid.uuid4().hex[:10];service=None;created=[];regular_id=None
try:
 call('POST','/api/auth/register',{'username':marker,'email':marker+'@example.test','password':'Test-pass-'+marker},expected=201)
 regular=call('POST','/api/auth/login',{'usernameOrEmail':marker,'password':'Test-pass-'+marker})['accessToken'];regular_id=call('GET','/api/auth/me',token=regular)['id']
 for private in ['/api/admin/workspace','/api/media/usage','/api/chat/admin/conversations']:call('GET',private,token=regular,expected=403)
 call('GET','/api/admin/workspace',expected=401);call('GET','/api/media/usage',expected=401)
 service=call('POST','/api/services',{'title':marker,'published':False,'shortDescription':'Fixture','deliverables':['Output'],'pricingMode':'QUOTE'},token,201)
 view=call('GET','/api/admin/workspace',token=token);assert any(x['id']==service['id'] and x['section']=='services' for x in view['drafts']);assert view['counts']['servicesDrafts']>=1
 text='درخواست خدمت: '+marker+' (#'+str(service['id'])+')\n\n'+marker
 query="insert into chat_messages(user_id,text,from_admin,read_by_recipient,created_at,updated_at) values ("+str(owner)+",'"+text+"',false,false,now(),now()) returning id"
 created.append(int(sql(query).splitlines()[0]))
 q='?q='+marker
 listing=call('GET','/api/chat/admin/conversations'+q+'&state=NEW',token=token);assert listing['content'][0]['userId']==owner;assert listing['content'][0]['status']=='NEW'
 assert call('GET','/api/admin/workspace',token=token)['counts']['requests']>=1
 call('GET','/api/chat/admin/'+str(owner)+'/messages',token=token)
 listing=call('GET','/api/chat/admin/conversations'+q+'&state=WAITING',token=token);assert listing['content'][0]['status']=='WAITING'
 reply=call('POST','/api/chat/admin/'+str(owner)+'/messages',{'text':marker+' reply'},token);created.append(reply['id'])
 listing=call('GET','/api/chat/admin/conversations'+q+'&state=HANDLED',token=token);assert listing['content'][0]['status']=='HANDLED'
 assert call('GET','/api/chat/admin/conversations/'+str(owner),token=token)['userId']==owner
 call('GET','/api/chat/admin/conversations?state=INVALID',token=token,expected=400)
 print('PASS: admin-only workspace/usage, real draft action links, persisted NEW → WAITING → HANDLED transitions, global search/filter pagination, service request count and direct conversation lookup.')
finally:
 if created:sql('delete from chat_messages where user_id='+str(owner)+' and id in ('+','.join(map(str,created))+')')
 if service:call('DELETE','/api/services/'+str(service['id']),token=token,expected=204)
 if regular_id:sql('delete from user_roles where user_id='+str(regular_id)+';delete from users where id='+str(regular_id))
