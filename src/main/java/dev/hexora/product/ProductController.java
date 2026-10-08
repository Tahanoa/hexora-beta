package dev.hexora.product;
import dev.hexora.dto.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal;
@RestController @RequestMapping("/api/products")
public class ProductController {
 private final ProductService service;private final ProductReviewService reviews;
 public ProductController(ProductService service,ProductReviewService reviews){this.service=service;this.reviews=reviews;}
 @GetMapping("/public") Object list(@RequestParam(defaultValue="0") int page){return ApiResponse.success(service.list(false,page));}
 @GetMapping("/public/{slug}") Object detail(@PathVariable String slug){return ApiResponse.success(service.detail(slug));}
 @GetMapping("/public/{slug}/reviews") Object reviews(@PathVariable String slug,@RequestParam(defaultValue="0") int page){return ApiResponse.success(reviews.list(slug,page));}
 @GetMapping("/{id}/review") @PreAuthorize("isAuthenticated()") Object ownReview(@PathVariable Long id,Principal user){return ApiResponse.success(reviews.mine(id,user.getName()));}
 @PostMapping("/{id}/review") @PreAuthorize("isAuthenticated()") Object saveReview(@PathVariable Long id,Principal user,@Valid @RequestBody ProductReviewService.Request r){return ApiResponse.success(reviews.save(id,user.getName(),r));}
 @GetMapping("/admin/{id}/reviews") @PreAuthorize("hasRole('ADMIN')") Object adminReviews(@PathVariable Long id,@RequestParam(defaultValue="0") int page){return ApiResponse.success(reviews.adminList(id,page));}
 @DeleteMapping("/admin/{id}/reviews/{reviewId}") @PreAuthorize("hasRole('ADMIN')") Object removeReview(@PathVariable Long id,@PathVariable Long reviewId){reviews.adminDelete(id,reviewId);return ApiResponse.success(java.util.Map.of("deleted",true));}
 @GetMapping("/admin") @PreAuthorize("hasRole('ADMIN')") Object admin(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="") String q,@RequestParam(defaultValue="ALL") String state){return ApiResponse.success(service.adminList(q,state,page));}
 @GetMapping("/admin/stats") @PreAuthorize("hasRole('ADMIN')") Object stats(){return ApiResponse.success(service.stats());}
 @GetMapping("/admin/{id}") @PreAuthorize("hasRole('ADMIN')") Object adminDetail(@PathVariable Long id){return ApiResponse.success(service.adminDetail(id));}
 @PostMapping("/admin") @PreAuthorize("hasRole('ADMIN')") Object create(@Valid @RequestBody ProductRequest r){return ApiResponse.created(service.save(null,r));}
 @PutMapping("/admin/{id}") @PreAuthorize("hasRole('ADMIN')") Object update(@PathVariable Long id,@Valid @RequestBody ProductRequest r){return ApiResponse.success(service.save(id,r));}
 @PostMapping(value="/admin/{id}/releases",consumes=MediaType.MULTIPART_FORM_DATA_VALUE) @PreAuthorize("hasRole('ADMIN')") Object upload(@PathVariable Long id,@RequestParam String version,@RequestParam(defaultValue="") String changelog,@RequestParam MultipartFile file){return ApiResponse.created(service.upload(id,version,changelog,file));}
 public record ReleaseState(boolean published) {}
 @PutMapping("/admin/{id}/releases/{releaseId}") @PreAuthorize("hasRole('ADMIN')") Object state(@PathVariable Long id,@PathVariable Long releaseId,@RequestBody ReleaseState r){return ApiResponse.success(service.releaseState(id,releaseId,r.published()));}
 @PostMapping("/{id}/purchase") @PreAuthorize("isAuthenticated()") Object buy(@PathVariable Long id,Principal user){return ApiResponse.success(service.buy(id,user.getName()));}
 @GetMapping("/mine") @PreAuthorize("isAuthenticated()") Object mine(Principal user,@RequestParam(defaultValue="0") int page){return ApiResponse.success(service.library(user.getName(),page));}
 @GetMapping("/orders") @PreAuthorize("isAuthenticated()") Object orders(Principal user,@RequestParam(defaultValue="0") int page){return ApiResponse.success(service.orders(user.getName(),page));}
 @GetMapping("/orders/{id}") @PreAuthorize("isAuthenticated()") ResponseEntity<?> order(@PathVariable java.util.UUID id,Principal user){return ResponseEntity.ok().cacheControl(CacheControl.noStore()).header("Referrer-Policy","no-referrer").body(ApiResponse.success(service.order(id.toString(),user.getName())));}
 @PostMapping("/orders/{id}/checkout") @PreAuthorize("isAuthenticated()") ResponseEntity<?> checkout(@PathVariable java.util.UUID id,Principal user,@Valid @RequestBody dev.hexora.payment.PaymentConsentRequest consent){return ResponseEntity.ok().cacheControl(CacheControl.noStore()).header("Referrer-Policy","no-referrer").body(ApiResponse.success(service.checkoutOrder(id.toString(),user.getName(),consent)));}
 @PostMapping("/orders/{id}/verify") @PreAuthorize("isAuthenticated()") ResponseEntity<?> verify(@PathVariable java.util.UUID id,Principal user){return ResponseEntity.ok().cacheControl(CacheControl.noStore()).header("Referrer-Policy","no-referrer").body(ApiResponse.success(service.verifyOrder(id.toString(),user.getName())));}
 @GetMapping("/{id}/releases/{releaseId}/download") @PreAuthorize("isAuthenticated()") ResponseEntity<byte[]> download(@PathVariable Long id,@PathVariable Long releaseId,Authentication user){
  boolean admin=user.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_ADMIN"));var file=service.download(id,releaseId,user.getName(),admin);
  return ResponseEntity.ok().cacheControl(CacheControl.noStore()).header("X-Content-Type-Options","nosniff").header("Referrer-Policy","no-referrer").header("X-File-SHA256",file.sha256()).header(HttpHeaders.CONTENT_DISPOSITION,ContentDisposition.attachment().filename(file.filename()).build().toString()).contentType(MediaType.APPLICATION_OCTET_STREAM).contentLength(file.data().length).body(file.data());
 }
}
