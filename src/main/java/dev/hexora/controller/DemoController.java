package dev.hexora.controller;
import dev.hexora.service.DemoService;
import dev.hexora.dto.response.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
@RestController
@RequestMapping("/api/demos")
public class DemoController {
 private final DemoService service;
 public DemoController(DemoService service){this.service=service;}
 public record SiteRequest(@NotBlank @Size(min=3,max=100) String title,@Size(max=80) @Pattern(regexp="^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$") String slug,@Positive Long projectId){}
 public record PublishRequest(@NotNull @Positive Long versionId){}
 @GetMapping Object all(){return ApiResponse.success(service.all());}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) Object create(@Valid @RequestBody SiteRequest request){return ApiResponse.created(service.create(request.title(),request.slug(),request.projectId()));}
 @PutMapping("/{id}") Object update(@PathVariable Long id,@Valid @RequestBody SiteRequest request){return ApiResponse.success(service.update(id,request.title(),request.projectId()));}
 @PostMapping("/{id}/versions") @ResponseStatus(HttpStatus.CREATED) Object upload(@PathVariable Long id,@RequestParam MultipartFile file,@RequestParam(required=false) String label){return ApiResponse.created(service.upload(id,file,label));}
 @PostMapping("/{id}/publish") Object publish(@PathVariable Long id,@Valid @RequestBody PublishRequest request){return ApiResponse.success(service.publish(id,request.versionId()));}
 @PostMapping("/{id}/deactivate") Object deactivate(@PathVariable Long id){return ApiResponse.success(service.deactivate(id));}
 @PostMapping("/{id}/versions/{versionId}/preview") Object preview(@PathVariable Long id,@PathVariable Long versionId){return ApiResponse.success(service.preview(id,versionId));}
 @DeleteMapping("/{id}/versions/{versionId}") Object deleteVersion(@PathVariable Long id,@PathVariable Long versionId){return ApiResponse.success(service.deleteVersion(id,versionId));}
 @DeleteMapping("/{id}") ResponseEntity<?> delete(@PathVariable Long id){service.delete(id);return ResponseEntity.noContent().build();}
}
