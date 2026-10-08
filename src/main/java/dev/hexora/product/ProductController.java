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
 private final ProductService service;
 public ProductController(ProductService service){this.service=service;}
 @GetMapping("/public") Object list(@RequestParam(defaultValue="0") int page){return ApiResponse.success(service.list(false,page));}
 @GetMapping("/public/{slug}") Object detail(@PathVariable String slug){return ApiResponse.success(service.detail(slug));}
 @GetMapping("/admin") @PreAuthorize("hasRole('ADMIN')") Object admin(@RequestParam(defaultValue="0") int page){return ApiResponse.success(service.list(true,page));}
 @GetMapping("/admin/{id}") @PreAuthorize("hasRole('ADMIN')") Object adminDetail(@PathVariable Long id){return ApiResponse.success(service.adminDetail(id));}
 @PostMapping("/admin") @PreAuthorize("hasRole('ADMIN')") Object create(@Valid @RequestBody ProductRequest r){return ApiResponse.created(service.save(null,r));}
 @PutMapping("/admin/{id}") @PreAuthorize("hasRole('ADMIN')") Object update(@PathVariable Long id,@Valid @RequestBody ProductRequest r){return ApiResponse.success(service.save(id,r));}
 @PostMapping(value="/admin/{id}/releases",consumes=MediaType.MULTIPART_FORM_DATA_VALUE) @PreAuthorize("hasRole('ADMIN')") Object upload(@PathVariable Long id,@RequestParam String version,@RequestParam(defaultValue="") String changelog,@RequestParam MultipartFile file){return ApiResponse.created(service.upload(id,version,changelog,file));}
 public record ReleaseState(boolean published) {}
 @PutMapping("/admin/{id}/releases/{releaseId}") @PreAuthorize("hasRole('ADMIN')") Object state(@PathVariable Long id,@PathVariable Long releaseId,@RequestBody ReleaseState r){return ApiResponse.success(service.releaseState(id,releaseId,r.published()));}
 @PostMapping("/{id}/purchase") @PreAuthorize("isAuthenticated()") Object buy(@PathVariable Long id,Principal user){return ApiResponse.success(service.buy(id,user.getName()));}
 @GetMapping("/mine") @PreAuthorize("isAuthenticated()") Object mine(Principal user,@RequestParam(defaultValue="0") int page){return ApiResponse.success(service.library(user.getName(),page));}
 @GetMapping("/orders") @PreAuthorize("isAuthenticated()") Object orders(Principal user,@RequestParam(defaultValue="0") int page){return ApiResponse.success(service.orders(user.getName(),page));}
 @PostMapping("/orders/{id}/verify") @PreAuthorize("isAuthenticated()") Object verify(@PathVariable String id,Principal user){return ApiResponse.success(service.verifyOrder(id,user.getName()));}
 @GetMapping("/{id}/releases/{releaseId}/download") @PreAuthorize("isAuthenticated()") ResponseEntity<byte[]> download(@PathVariable Long id,@PathVariable Long releaseId,Authentication user){
  boolean admin=user.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_ADMIN"));var file=service.download(id,releaseId,user.getName(),admin);
  return ResponseEntity.ok().cacheControl(CacheControl.noStore()).header("X-Content-Type-Options","nosniff").header("Referrer-Policy","no-referrer").header("X-File-SHA256",file.sha256()).header(HttpHeaders.CONTENT_DISPOSITION,ContentDisposition.attachment().filename(file.filename()).build().toString()).contentType(MediaType.APPLICATION_OCTET_STREAM).contentLength(file.data().length).body(file.data());
 }
}
