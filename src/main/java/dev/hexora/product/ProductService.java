package dev.hexora.product;
import dev.hexora.api.ApiException;
import dev.hexora.model.User;
import dev.hexora.enums.MediaType;
import dev.hexora.repository.*;
import dev.hexora.payment.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;
import java.time.Instant;
import java.net.URI;
import java.io.*;
import java.security.MessageDigest;
import java.util.zip.*;
@Service
public class ProductService {
 private final ProductRepository products;private final ProductReleaseRepository releases;private final ProductFileRepository files;
 private final DownloadAuditRepository downloads;private final UserRepository users;private final MediaRepository media;
 private final PaymentRepository payments;private final PaymentService gateway;
 public ProductService(ProductRepository p,ProductReleaseRepository r,ProductFileRepository f,DownloadAuditRepository d,UserRepository u,MediaRepository m,PaymentRepository pay,PaymentService g){products=p;releases=r;files=f;downloads=d;users=u;media=m;payments=pay;gateway=g;}
 private ApiException bad(String message){return new ApiException(HttpStatus.BAD_REQUEST,message);}
 private User user(String name){return users.findByUsernameIgnoreCase(name).orElseThrow(ApiException::notFound);}
 private User lockedUser(String name){return users.lockedByUsername(name).orElseThrow(ApiException::notFound);}
 private Product locked(Long id){return products.locked(id).orElseThrow(ApiException::notFound);}
 public Map<String,Object> view(Product p){var m=new LinkedHashMap<String,Object>();m.put("id",p.id);m.put("slug",p.slug);m.put("title",p.title);m.put("titleEn",p.titleEn);m.put("description",p.description);m.put("descriptionEn",p.descriptionEn);m.put("category",p.category);m.put("features",p.features);m.put("featuresEn",p.featuresEn);m.put("requirements",p.requirements);m.put("demoUrl",p.demoUrl);m.put("coverId",p.coverId);m.put("price",p.price);m.put("published",p.published);return m;}
 public Object releaseView(ProductRelease v){return Map.of("id",v.id,"version",v.version,"changelog",v.changelog==null?"":v.changelog,"published",v.published,"sha256",v.sha256,"size",v.size,"createdAt",v.createdAt);}
 public Object list(boolean admin,int page){var paging=PageRequest.of(Math.max(0,page),12,Sort.by("createdAt").descending());return (admin?products.findAll(paging):products.findByPublishedTrue(paging)).map(this::view);}
 public Object adminList(String q,String state,int page){if(q.length()>100)throw bad("Search is too long");Boolean published=switch(state){case "ALL"->null;case "PUBLISHED"->true;case "DRAFT"->false;default->throw bad("Invalid publication filter");};return products.search(q.trim().toLowerCase(Locale.ROOT),published,PageRequest.of(Math.max(0,page),12,Sort.by("createdAt").descending())).map(this::view);}
 public Object stats(){long total=products.count(),published=products.countByPublishedTrue();return Map.of("total",total,"published",published,"drafts",total-published,"releases",releases.count());}
 public Object detail(String slug){var p=products.findBySlugAndPublishedTrue(slug).orElseThrow(ApiException::notFound);var out=view(p);out.put("releases",releases.findByProductIdAndPublishedTrueOrderByCreatedAtDesc(p.id).stream().map(this::releaseView).toList());return out;}
 public Object adminDetail(Long id){var p=products.findById(id).orElseThrow(ApiException::notFound);var out=view(p);out.put("releases",releases.findByProductIdOrderByCreatedAtDesc(id).stream().map(this::releaseView).toList());return out;}
 @Transactional public Object save(Long id,ProductRequest r){
  if(r.slug().equals("library"))throw bad("This product URL is reserved");
  if(r.price()>0&&r.price()<1000)throw bad("Paid product price must be at least 1000 toman");
  if(r.demoUrl()!=null&&!r.demoUrl().isBlank()){URI url;try{url=URI.create(r.demoUrl());}catch(Exception e){throw bad("Invalid demo URL");}if(!"https".equals(url.getScheme())||url.getHost()==null||url.getUserInfo()!=null)throw bad("Demo URL must use HTTPS");}
  if(r.coverId()!=null&&media.findById(r.coverId()).filter(m->m.getType()==MediaType.IMAGE).isEmpty())throw bad("Cover must be an existing image");
  Product p=id==null?new Product():locked(id);
  if(id==null){if(products.existsBySlug(r.slug()))throw bad("Product slug already exists");p.slug=r.slug();}else if(!p.slug.equals(r.slug()))throw bad("Product URL cannot change after creation");
  if(r.published()&&(id==null||!releases.existsByProductIdAndPublishedTrue(id)))throw bad("Publish a reviewed release before publishing the product");
  p.title=r.title().trim();p.titleEn=r.titleEn();p.description=r.description();p.descriptionEn=r.descriptionEn();p.category=r.category();p.features=r.features();p.featuresEn=r.featuresEn();p.requirements=r.requirements();p.demoUrl=r.demoUrl();p.coverId=r.coverId();p.price=r.price();p.published=r.published();return view(products.saveAndFlush(p));
 }
 @Transactional public Object upload(Long id,String version,String changelog,MultipartFile file){
  locked(id);if(version==null||!version.matches("[A-Za-z0-9][A-Za-z0-9._-]{0,49}"))throw bad("Invalid release version");
  if(changelog!=null&&changelog.length()>10000)throw bad("Changelog is too long");
  if(releases.existsByProductIdAndVersion(id,version))throw bad("Version already exists; upload a new version instead");
  if(file.isEmpty()||file.getSize()>8*1024*1024||file.getOriginalFilename()==null||!file.getOriginalFilename().toLowerCase(Locale.ROOT).endsWith(".zip"))throw bad("Select a ZIP up to 8 MB");
  byte[] data;try{data=file.getBytes();}catch(IOException e){throw bad("Cannot read uploaded file");}validateZip(data);
  var v=new ProductRelease();v.productId=id;v.version=version;v.changelog=changelog;v.size=data.length;
  try{v.sha256=HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(data));}catch(Exception e){throw new IllegalStateException("SHA-256 unavailable");}
  releases.saveAndFlush(v);var binary=new ProductFile();binary.id=v.id;binary.data=data;files.saveAndFlush(binary);return releaseView(v);
 }
 private void validateZip(byte[] data){
  if(data.length<4||data[0]!=80||data[1]!=75||data[2]!=3||data[3]!=4)throw bad("Invalid ZIP signature");
  try(var zip=new ZipInputStream(new ByteArrayInputStream(data))){long expanded=0;int count=0,fileCount=0;var names=new HashSet<String>();byte[] buffer=new byte[8192];ZipEntry entry;
   while((entry=zip.getNextEntry())!=null){String name=entry.getName();if(++count>3000||name.length()>240||name.startsWith("/")||name.contains("\\")||name.contains(":")||name.chars().anyMatch(c->c<32)||Arrays.asList(name.split("/",-1)).contains("..")||!names.add(name))throw bad("Unsafe ZIP entry");
    if(!entry.isDirectory())fileCount++;int n;while((n=zip.read(buffer))!=-1){expanded+=n;if(expanded>100L*1024*1024)throw bad("Expanded ZIP exceeds 100 MB");}zip.closeEntry();
   }if(fileCount==0)throw bad("ZIP must contain a file");
  }catch(IOException e){throw bad("Invalid or unsupported ZIP archive");}
 }
 @Transactional public Object releaseState(Long productId,Long releaseId,boolean published){var p=locked(productId);var v=releases.findById(releaseId).filter(x->x.productId.equals(productId)).orElseThrow(ApiException::notFound);v.published=published;releases.saveAndFlush(v);if(!published&&!releases.existsByProductIdAndPublishedTrue(productId)){p.published=false;products.save(p);}return releaseView(v);}
 @Transactional public Object buy(Long id,String username){
  var user=lockedUser(username);var product=locked(id);if(!product.published||!releases.existsByProductIdAndPublishedTrue(id))throw ApiException.notFound();
  if(payments.existsByProductIdAndPurchaserIdAndStatus(id,user.getId(),"PAID"))return Map.of("owned",true);
  var existing=payments.findFirstByProductIdAndPurchaserIdAndStatusInOrderByCreatedAtDesc(id,user.getId(),List.of("CREATED","PENDING","REQUEST_FAILED"));
  Payment p=existing.orElseGet(Payment::new);if(existing.isEmpty()){p.productId=id;p.purchaserId=user.getId();p.buyer=user.getUsername();p.amount=product.price;p.description=("Product: "+product.title);
   payments.saveAndFlush(p);
  }
  if(p.status.equals("PAID"))return Map.of("owned",true);
  return Map.of("orderId",p.id,"status",p.status,"invoicePath","/account/orders/"+p.id,"invoiceType",p.invoiceType(),"shareable",false);
 }
 private Payment ownedOrder(String id,Long userId,boolean lock){return (lock?payments.locked(id):payments.findById(id)).filter(p->userId.equals(p.purchaserId)&&p.productId!=null).orElseThrow(ApiException::notFound);}
 public Object order(String id,String username){return gateway.invoiceView(ownedOrder(id,user(username).getId(),false));}
 @Transactional public Object checkoutOrder(String id,String username,PaymentConsentRequest consent){
  var u=lockedUser(username);var p=ownedOrder(id,u.getId(),true);if(p.status.equals("PAID"))return gateway.invoiceView(p);
  var product=locked(p.productId);if(!product.published||!releases.existsByProductIdAndPublishedTrue(product.id))throw ApiException.notFound();
  gateway.acceptTerms(p,consent);
  if(p.amount==0){p.status="PAID";p.refId="FREE";p.paidAt=Instant.now();payments.saveAndFlush(p);return gateway.invoiceView(p);}
  var result=(Map<?,?>)gateway.checkout(p.id);var out=gateway.invoiceView(p);if(result.get("redirectUrl")!=null)out.put("redirectUrl",result.get("redirectUrl"));return out;
 }
 public Object library(String username,int page){var u=user(username);return products.owned(u.getId(),PageRequest.of(Math.max(0,page),12,Sort.by("createdAt").descending())).map(p->{var m=view(p);m.put("releases",releases.findByProductIdAndPublishedTrueOrderByCreatedAtDesc(p.id).stream().map(this::releaseView).toList());return m;});}
 public Object orders(String username,int page){var u=user(username);return payments.findByPurchaserIdOrderByCreatedAtDesc(u.getId(),PageRequest.of(Math.max(0,page),20)).map(p->Map.of("id",p.id,"productId",p.productId,"description",p.description,"amount",p.amount,"status",p.status,"refId",p.refId==null?"":p.refId,"createdAt",p.createdAt));}
 @Transactional public Object verifyOrder(String id,String username){var u=user(username);var p=payments.locked(id).filter(x->u.getId().equals(x.purchaserId)&&x.productId!=null).orElseThrow(ApiException::notFound);gateway.verify(id);return gateway.invoiceView(p);}
 public record Download(byte[] data,String filename,String sha256) {}
 @Transactional public Download download(Long productId,Long releaseId,String username,boolean admin){
  var u=lockedUser(username);if(!admin&&!payments.existsByProductIdAndPurchaserIdAndStatus(productId,u.getId(),"PAID"))throw new ApiException(HttpStatus.FORBIDDEN,"A verified purchase is required");
  var v=releases.findById(releaseId).filter(x->x.productId.equals(productId)&&(admin||x.published)).orElseThrow(ApiException::notFound);
  if(downloads.countByUserIdAndCreatedAtAfter(u.getId(),Instant.now().minusSeconds(60))>=12)throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,"Download limit reached; try again in one minute");
  var p=products.findById(productId).orElseThrow(ApiException::notFound);var binary=files.findById(v.id).orElseThrow(ApiException::notFound);
  var audit=new DownloadAudit();audit.userId=u.getId();audit.productId=productId;audit.releaseId=v.id;downloads.save(audit);
  return new Download(binary.data,p.slug+"-"+v.version+".zip",v.sha256);
 }
}
