"""Integration checks against a running app + PostgreSQL. Uses Python standard library.
Run with HEXORA_TEST_BASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD configured.
"""
import base64, json, os, uuid
from urllib.request import Request, urlopen
from urllib.error import HTTPError
base=os.environ.get('HEXORA_TEST_BASE_URL','http://127.0.0.1:8080')

def call(method,path,data=None,token=None,expected=200,content_type='application/json'):
    body=json.dumps(data).encode() if data is not None and content_type=='application/json' else data
    headers={'Content-Type':content_type}
    if token: headers['Authorization']='Bearer '+token
    try:
        with urlopen(Request(base+path,body,headers,method=method),timeout=20) as response:
            status=response.status;raw=response.read()
    except HTTPError as error:
        status=error.code;raw=error.read()
    assert status==expected,(method,path,status,raw[:500])
    return json.loads(raw).get('data') if raw and raw.startswith(b'{') else raw

suffix=uuid.uuid4().hex[:10]
admin=call('POST','/api/auth/login',{'usernameOrEmail':os.environ['ADMIN_USERNAME'],'password':os.environ['ADMIN_PASSWORD']})['accessToken']
service=None;project=None;image=None
try:
    project=call('POST','/api/projects',{'title':'Service test '+suffix,'slug':'project-'+suffix,'status':'COMPLETED'},admin,201)
    png=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3p0AAAAASUVORK5CYII=')
    boundary='hexora'+suffix
    body=(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="cover.png"\r\nContent-Type: image/png\r\n\r\n'.encode()+png+f'\r\n--{boundary}--\r\n'.encode())
    image=call('POST','/api/media/upload/image',body,admin,201,'multipart/form-data; boundary='+boundary)
    payload={'title':'Service test '+suffix,'slug':'service-'+suffix,'shortDescription':'Clear introduction','description':'Full description','cover':image['url'],'icon':'fa-solid fa-code','features':'["Feature A","Feature B"]','audience':'Businesses','scope':'Implementation','exclusions':'Hosting fees','duration':'2 weeks','pricingMode':'FROM','priceLabel':'100 units','support':'30 days','revisions':'2 rounds','deliverables':['Admin panel','Documentation'],'relatedProjectIds':[project['id']],'faqs':[{'question':'How long?','answer':'Two weeks.'}],'published':False,'featured':True,'order':1}
    service=call('POST','/api/services',payload,admin,201);sid=service['id']
    assert not any(x['id']==sid for x in call('GET','/api/services/public'))
    call('GET',f'/api/services/public/{sid}',expected=404)
    call('GET','/api/services/public/slug/'+payload['slug'],expected=404)
    call('POST','/api/services',payload,expected=401)
    call('PUT',f'/api/services/{sid}',dict(payload,published=True,deliverables=[]),admin,400)
    call('PUT',f'/api/services/{sid}',dict(payload,relatedProjectIds=[9223372036854775807]),admin,400)
    payload['published']=True
    call('PUT',f'/api/services/{sid}',payload,admin)
    public=call('GET','/api/services/public/slug/'+payload['slug'])
    for key in payload: assert public[key]==payload[key],(key,public[key],payload[key])
    assert any(x['id']==sid for x in call('GET','/api/services/public/active'))
    call('POST','/api/services',payload,admin,409)
    assert b'serviceDetail' in call('GET','/services/'+payload['slug'])
    user='service_test_'+suffix;password='Service-test-password-2026'
    call('POST','/api/auth/register',{'username':user,'email':user+'@example.org','password':password},expected=201)
    token=call('POST','/api/auth/login',{'usernameOrEmail':user,'password':password})['accessToken']
    call('GET','/api/services',token=token,expected=403)
    call('POST','/api/chat/messages',{'text':'My project','serviceId':sid},token,403)
    owner=call('PATCH','/api/auth/phone',{'phone':'09123456789'},token)
    sent=call('POST','/api/chat/messages',{'text':'My project','serviceId':sid},token,200)
    assert payload['title'] in sent['text'] and 'My project' in sent['text']
    history=call('GET',f'/api/chat/admin/{owner["id"]}/messages',token=admin)
    assert any(x['id']==sent['id'] and payload['title'] in x['text'] for x in history)
    payload['published']=False;payload['relatedProjectIds']=[];payload['faqs']=[];payload['deliverables']=[];payload['cover']=None
    updated=call('PUT',f'/api/services/{sid}',payload,admin)
    assert updated['relatedProjectIds']==[] and updated['faqs']==[] and updated.get('cover') is None
    call('POST','/api/chat/messages',{'text':'Draft request','serviceId':sid},token,404)
    print('Services API integration passed: media, CRUD, publishing, validation, related work, FAQs and request chat.')
finally:
    if service: call('DELETE',f'/api/services/{service["id"]}',token=admin,expected=204)
    if project: call('DELETE',f'/api/projects/{project["id"]}',token=admin,expected=204)
    if image: call('DELETE',f'/api/media/{image["id"]}',token=admin,expected=204)
