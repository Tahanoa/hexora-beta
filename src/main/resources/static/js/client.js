(() => {
 const nativeFetch=window.fetch.bind(window);
 window.fetch=async(input,options={})=>{const url=new URL(typeof input==='string'?input:input.url,location.href);if(url.origin!==location.origin)return nativeFetch(input,options);const headers=new Headers(options.headers||input.headers);const token=localStorage.getItem('accessToken');if(token)headers.set('Authorization',`Bearer ${token}`);const response=await nativeFetch(input,{...options,headers});if(response.status===401){localStorage.removeItem('accessToken');localStorage.removeItem('user');}return response;};
 window.loadSession=async()=>{const response=await fetch('/api/auth/me');if(!response.ok){localStorage.removeItem('accessToken');localStorage.removeItem('user');return null;}const result=await response.json();localStorage.setItem('user',JSON.stringify(result.data));return result.data;};
})();
