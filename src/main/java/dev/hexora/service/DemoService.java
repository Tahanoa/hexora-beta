package dev.hexora.service;

import dev.hexora.api.ApiException;
import dev.hexora.model.*;
import dev.hexora.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class DemoService {
 private final DemoSiteRepository demos;
 private final DemoVersionRepository versions;
 private final DemoAssetRepository assets;
 private final ProjectRepository projects;
 private final String baseUrl;
 public DemoService(DemoSiteRepository demos,DemoVersionRepository versions,DemoAssetRepository assets,ProjectRepository projects,@Value("${app.demo.public-base-url:}") String baseUrl){
  this.demos=demos;this.versions=versions;this.assets=assets;this.projects=projects;
  this.baseUrl=baseUrl.replaceAll("/+$","");
  if(!this.baseUrl.isEmpty()){
   var uri=java.net.URI.create(this.baseUrl);
   if(!Set.of("https","http").contains(uri.getScheme())||uri.getHost()==null||uri.getUserInfo()!=null||uri.getQuery()!=null||uri.getFragment()!=null||!(uri.getPath()==null||uri.getPath().isEmpty()))throw new IllegalStateException("DEMO_PUBLIC_BASE_URL must be an HTTP(S) origin without a path");
   if(this.baseUrl.length()>150)throw new IllegalStateException("Demo origin is too long");
  }
 }
 public record SiteView(Long id,String title,String slug,Long projectId,String projectTitle,Long publishedVersionId,String publicUrl,List<VersionView> versions){}
 public record VersionView(Long id,long number,String label,String uploadName,String entryPoint,int fileCount,long totalBytes,java.time.LocalDateTime createdAt){}
 public record Preview(String url,Instant expiresAt){}
 public record Content(byte[] bytes,String contentType){}
 private DemoSite required(Long id){return demos.findById(id).orElseThrow(ApiException::notFound);}
 private DemoSite locked(Long id){return demos.lockById(id).orElseThrow(ApiException::notFound);}
 private DemoVersion version(Long demoId,Long versionId){var v=versions.findById(versionId).orElseThrow(ApiException::notFound);if(!v.getDemoId().equals(demoId))throw ApiException.notFound();return v;}
 public String publicUrl(DemoSite d){return baseUrl+"/demo-sites/"+d.getSlug()+"/";}
 private VersionView view(DemoVersion v){return new VersionView(v.getId(),v.getNumber(),v.getLabel(),v.getUploadName(),v.getEntryPoint(),v.getFileCount(),v.getTotalBytes(),v.getCreatedAt());}
 private SiteView view(DemoSite d){String projectTitle=d.getProjectId()==null?null:projects.findById(d.getProjectId()).map(Project::getTitle).orElse(null);return new SiteView(d.getId(),d.getTitle(),d.getSlug(),d.getProjectId(),projectTitle,d.getPublishedVersionId(),publicUrl(d),versions.findByDemoIdOrderByNumberDesc(d.getId()).stream().map(this::view).toList());}
 @Transactional(readOnly=true) public List<SiteView> all(){return demos.findAll(Sort.by("updatedAt").descending()).stream().map(this::view).toList();}
 private void attach(DemoSite demo,Long projectId){
  if(projectId!=null){projects.findById(projectId).orElseThrow(ApiException::notFound);for(var d:demos.findAll())if(projectId.equals(d.getProjectId())&&!Objects.equals(d.getId(),demo.getId()))throw new ApiException(HttpStatus.CONFLICT,"This project already has a demo");}
  if(!Objects.equals(demo.getProjectId(),projectId))unlink(demo);
  demo.setProjectId(projectId);
 }
 public SiteView create(String title,String slug,Long projectId){
  DemoSite d=new DemoSite();d.setTitle(title.trim());d.setSlug(slug==null||slug.isBlank()?"demo-"+UUID.randomUUID().toString().substring(0,8):slug);
  if(demos.findBySlug(d.getSlug()).isPresent())throw new ApiException(HttpStatus.CONFLICT,"Demo address already exists");
  attach(d,projectId);return view(demos.saveAndFlush(d));
 }
 public SiteView update(Long id,String title,Long projectId){var d=locked(id);d.setTitle(title.trim());attach(d,projectId);link(d);return view(demos.saveAndFlush(d));}
 public SiteView upload(Long id,MultipartFile file,String label){
  var d=locked(id);if(versions.countByDemoId(id)>=50)throw new ApiException(HttpStatus.BAD_REQUEST,"A demo supports up to 50 versions; delete an unused version first");
  if(file.isEmpty()||file.getSize()>DemoBundle.MAX_UPLOAD)throw new ApiException(HttpStatus.BAD_REQUEST,"Upload HTML or ZIP up to 10 MB");
  DemoBundle.Bundle bundle;
  try{bundle=DemoBundle.read(file.getOriginalFilename(),file.getBytes());}catch(java.io.IOException|IllegalArgumentException ex){throw new ApiException(HttpStatus.BAD_REQUEST,ex.getMessage());}
  var v=new DemoVersion();v.setDemoId(id);v.setNumber(d.getNextVersion()+1);v.setLabel(label==null?null:label.trim());
  if(v.getLabel()!=null&&v.getLabel().length()>200)throw new ApiException(HttpStatus.BAD_REQUEST,"Version label must be at most 200 characters");
  String name=Optional.ofNullable(file.getOriginalFilename()).orElse("upload").replaceAll("[\\r\\n\\/\\\\]","_");v.setUploadName(name.substring(0,Math.min(150,name.length())));
  v.setEntryPoint(bundle.entryPoint());v.setFileCount(bundle.files().size());v.setTotalBytes(bundle.totalBytes());versions.saveAndFlush(v);
  for(var entry:bundle.files().entrySet()){var asset=new DemoAsset();asset.setVersionId(v.getId());asset.setPath(entry.getKey());asset.setContentType(DemoBundle.contentType(entry.getKey()));asset.setData(entry.getValue());assets.save(asset);}
  assets.flush();d.setNextVersion(v.getNumber());demos.saveAndFlush(d);return view(d);
 }
 public SiteView publish(Long id,Long versionId){var d=locked(id);version(id,versionId);d.setPublishedVersionId(versionId);link(d);return view(demos.saveAndFlush(d));}
 public SiteView deactivate(Long id){var d=locked(id);unlink(d);d.setPublishedVersionId(null);return view(demos.saveAndFlush(d));}
 private void link(DemoSite d){if(d.getPublishedVersionId()!=null&&d.getProjectId()!=null)projects.findById(d.getProjectId()).ifPresent(p->{p.setDemoUrl(publicUrl(d));projects.saveAndFlush(p);});}
 private void unlink(DemoSite d){if(d.getProjectId()!=null)projects.findById(d.getProjectId()).ifPresent(p->{if(publicUrl(d).equals(p.getDemoUrl())){p.setDemoUrl(null);projects.saveAndFlush(p);}});}
 public SiteView deleteVersion(Long id,Long versionId){var d=locked(id);version(id,versionId);if(versionId.equals(d.getPublishedVersionId()))throw new ApiException(HttpStatus.CONFLICT,"Deactivate this demo before deleting its live version");assets.deleteByVersionId(versionId);versions.deleteById(versionId);versions.flush();return view(d);}
 public void delete(Long id){var d=locked(id);unlink(d);for(var v:versions.findByDemoIdOrderByNumberDesc(id)){assets.deleteByVersionId(v.getId());versions.delete(v);}versions.flush();demos.delete(d);demos.flush();}
 private static String hash(String token){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));}catch(NoSuchAlgorithmException ex){throw new IllegalStateException(ex);}}
 public Preview preview(Long id,Long versionId){locked(id);var v=version(id,versionId);byte[] random=new byte[32];new SecureRandom().nextBytes(random);String token=Base64.getUrlEncoder().withoutPadding().encodeToString(random);v.setPreviewHash(hash(token));v.setPreviewExpiresAt(Instant.now().plusSeconds(600));versions.saveAndFlush(v);return new Preview("/demo-preview/"+v.getId()+"/"+token+"/",v.getPreviewExpiresAt());}
 private Content content(DemoVersion v,String path){
  String file=path.isEmpty()?v.getEntryPoint():path;try{DemoBundle.path(file);}catch(IllegalArgumentException ex){throw ApiException.notFound();}
  var a=assets.findByVersionIdAndPath(v.getId(),file).orElseThrow(ApiException::notFound);return new Content(a.getData(),a.getContentType());
 }
 @Transactional(readOnly=true) public Content publicContent(String slug,String path){var d=demos.findBySlug(slug).orElseThrow(ApiException::notFound);if(d.getPublishedVersionId()==null)throw ApiException.notFound();return content(version(d.getId(),d.getPublishedVersionId()),path);}
 @Transactional(readOnly=true) public Content previewContent(Long versionId,String token,String path){
  var v=versions.findById(versionId).orElseThrow(ApiException::notFound);
  if(v.getPreviewHash()==null||v.getPreviewExpiresAt()==null||!v.getPreviewExpiresAt().isAfter(Instant.now())||!MessageDigest.isEqual(hash(token).getBytes(StandardCharsets.US_ASCII),v.getPreviewHash().getBytes(StandardCharsets.US_ASCII)))throw ApiException.notFound();
  required(v.getDemoId());return content(v,path);
 }
}
