package dev.hexora.controller;
import dev.hexora.service.DemoService;
import dev.hexora.api.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriUtils;
import java.nio.charset.StandardCharsets;
import java.net.URI;
@RestController
public class DemoContentController {
 private final DemoService service;
 private final String frameAncestors;
 public DemoContentController(DemoService service,@Value("${app.demo.panel-origin:}") String panelOrigin){
  this.service=service;frameAncestors="'self'"+(panelOrigin.isBlank()?"":" "+origin(panelOrigin));
 }
 private static String origin(String value){var uri=URI.create(value);if(!java.util.Set.of("http","https").contains(uri.getScheme())||uri.getHost()==null||uri.getUserInfo()!=null||uri.getQuery()!=null||uri.getFragment()!=null||!(uri.getPath()==null||uri.getPath().isEmpty()))throw new IllegalStateException("DEMO_PANEL_ORIGIN must be an HTTP(S) origin");return value;}
 private String path(HttpServletRequest request,String prefix){String raw=request.getRequestURI();if(!raw.startsWith(prefix))throw ApiException.notFound();try{return UriUtils.decode(raw.substring(prefix.length()),StandardCharsets.UTF_8);}catch(IllegalArgumentException ex){throw ApiException.notFound();}}
 private ResponseEntity<byte[]> content(DemoService.Content c){
  // An opaque sandbox origin prevents scripts from accessing panel storage/DOM,
  // cookies, parent navigation and service workers, even on the default host.
  String csp="sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' http: https:; style-src 'unsafe-inline' http: https:; img-src http: https: data: blob:; font-src http: https: data:; media-src http: https: data: blob:; connect-src http: https:; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'; frame-ancestors "+frameAncestors;
  return ResponseEntity.ok().contentType(MediaType.parseMediaType(c.contentType())).cacheControl(CacheControl.noStore())
   .header("Content-Security-Policy",csp).header("X-Content-Type-Options","nosniff").header("Referrer-Policy","no-referrer")
   .header("Access-Control-Allow-Origin","*").header("Cross-Origin-Resource-Policy","cross-origin").body(c.bytes());
 }
 @GetMapping({"/demo-sites/{slug}","/demo-sites/{slug}/","/demo-sites/{slug}/**"}) ResponseEntity<byte[]> published(@PathVariable String slug,HttpServletRequest request){
  String prefix="/demo-sites/"+slug+"/";
  if(request.getRequestURI().equals(prefix.substring(0,prefix.length()-1))){service.publicContent(slug,"");return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(prefix)).build();}
  return content(service.publicContent(slug,path(request,prefix)));
 }
 @GetMapping({"/demo-preview/{versionId}/{token}/","/demo-preview/{versionId}/{token}/**"}) ResponseEntity<byte[]> preview(@PathVariable Long versionId,@PathVariable String token,HttpServletRequest request){
  if(!token.matches("[A-Za-z0-9_-]{43}"))throw ApiException.notFound();
  return content(service.previewContent(versionId,token,path(request,"/demo-preview/"+versionId+"/"+token+"/")));
 }
}
