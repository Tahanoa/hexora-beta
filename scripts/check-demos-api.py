"""Run against a disposable app/database. Creates and cleans demo, project and assets."""
import io,json,os,uuid,zipfile
from urllib.request import Request,urlopen
from urllib.error import HTTPError
base=os.environ.get('HEXORA_TEST_BASE_URL','http://127.0.0.1:8080')
def request(method,path,data=None,token=None,expected=200,mime='application/json'):
    body=json.dumps(data).encode() if data is not None and mime=='application/json' else data
    headers={'Content-Type':mime}
    if token:headers['Authorization']='Bearer '+token
    try:
        with urlopen(Request(base+path,body,headers,method=method),timeout=30) as response:status=response.status;raw=response.read();headers=dict(response.headers)
    except HTTPError as error:status=error.code;raw=error.read();headers=dict(error.headers)
    assert status==expected,(method,path,status,raw[:500])
    if headers.get('Content-Type','').startswith('application/json') and raw:
        return json.loads(raw).get('data')
    return raw,headers

def upload(demo_id,name,data,expected=201):
    boundary='hexora'+uuid.uuid4().hex
    body=(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{name}"\r\nContent-Type: application/octet-stream\r\n\r\n'.encode()+data+f'\r\n--{boundary}--\r\n'.encode())
    return request('POST',f'/api/demos/{demo_id}/versions',body,token,expected,'multipart/form-data; boundary='+boundary)

def zip_bytes(files):
    out=io.BytesIO()
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
        for path,data in files.items():z.writestr(path,data)
    return out.getvalue()

suffix=uuid.uuid4().hex[:10];project=None;demo=None;other=None
request('GET','/api/demos',expected=401)
token=request('POST','/api/auth/login',{'usernameOrEmail':os.environ['ADMIN_USERNAME'],'password':os.environ['ADMIN_PASSWORD']})['accessToken']
try:
    project=request('POST','/api/projects',{'title':'Demo project '+suffix,'slug':'demo-project-'+suffix,'status':'COMPLETED'},token,201)
    slug='demo-'+suffix
    demo=request('POST','/api/demos',{'title':'Demo test '+suffix,'slug':slug,'projectId':project['id']},token,201);did=demo['id'];public='/demo-sites/'+slug+'/'
    request('POST','/api/demos',{'title':'Duplicate slug','slug':slug},token,409)
    request('POST','/api/demos',{'title':'Duplicate connection','slug':'other-'+suffix,'projectId':project['id']},token,409)
    request('GET',public,expected=404)
    demo=upload(did,'first.html',b'<html><body><h1>Version one</h1><script>document.body.dataset.running="yes"</script></body></html>');v1=demo['versions'][0]['id']
    assert demo['publishedVersionId'] is None
    preview=request('POST',f'/api/demos/{did}/versions/{v1}/preview',token=token)
    raw,headers=request('GET',preview['url']);assert b'Version one' in raw
    assert "sandbox allow-scripts" in headers['Content-Security-Policy'] and 'allow-same-origin' not in headers['Content-Security-Policy']
    assert headers['Access-Control-Allow-Origin']=='*' and headers['Referrer-Policy']=='no-referrer'
    assert headers['X-Content-Type-Options']=='nosniff'
    request('GET',f'/demo-preview/{v1}/'+('a'*43)+'/',expected=404)
    request('GET',public,expected=404)
    other=request('POST','/api/demos',{'title':'Other demo '+suffix,'slug':'other-'+suffix},token,201)
    request('POST',f'/api/demos/{other["id"]}/publish',{'versionId':v1},token,404)
    published=request('POST',f'/api/demos/{did}/publish',{'versionId':v1},token)
    assert published['publishedVersionId']==v1
    raw,headers=request('GET',public);assert b'Version one' in raw
    linked=request('GET',f'/api/projects/{project["id"]}',token=token);assert linked['demoUrl']==public
    # The project editor must continue accepting its managed local demo URL.
    request('PUT',f'/api/projects/{project["id"]}',{k:linked.get(k) for k in ['title','slug','shortDescription','description','image','demoUrl','githubUrl','clientName','status','projectDate']},token)
    upload(did,'traversal.zip',zip_bytes({'index.html':'ok','../secret.txt':'no'}),400)
    upload(did,'server.zip',zip_bytes({'index.html':'ok','server.php':'no'}),400)
    upload(did,'missing.zip',zip_bytes({'app.js':'no'}),400)
    demo=upload(did,'site.zip',zip_bytes({'dist/index.html':'<h1>Version two</h1><script src="assets/app.js"></script>','dist/assets/app.js':'console.log("two")','dist/styles.css':'body{color:green}'}));v2=demo['versions'][0]['id']
    raw,_=request('GET',public);assert b'Version one' in raw
    request('POST',f'/api/demos/{did}/publish',{'versionId':v2},token)
    raw,_=request('GET',public);assert b'Version two' in raw
    raw,headers=request('GET',public+'assets/app.js');assert b'console.log' in raw and headers['Content-Type'].startswith('text/javascript')
    request('DELETE',f'/api/demos/{did}/versions/{v2}',token=token,expected=409)
    request('POST',f'/api/demos/{did}/publish',{'versionId':v1},token)
    raw,_=request('GET',public);assert b'Version one' in raw
    request('POST',f'/api/demos/{did}/deactivate',token=token)
    request('GET',public,expected=404);request('GET',public+'assets/app.js',expected=404)
    assert request('GET',f'/api/projects/{project["id"]}',token=token).get('demoUrl') is None
    deleted=request('DELETE',f'/api/demos/{did}/versions/{v2}',token=token);assert len(deleted['versions'])==1
    assert b'dmPreviewFrame' in request('GET','/manage/demos')[0]
    print('Demo API integration passed: private draft, scoped preview, security headers, publish, assets, project link, rollback, disable and archive rejection.')
finally:
    if demo:request('DELETE',f'/api/demos/{demo["id"]}',token=token,expected=204)
    if other:request('DELETE',f'/api/demos/{other["id"]}',token=token,expected=204)
    if project:request('DELETE',f'/api/projects/{project["id"]}',token=token,expected=204)
