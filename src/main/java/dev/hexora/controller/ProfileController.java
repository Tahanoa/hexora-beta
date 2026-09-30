package dev.hexora.controller;
import dev.hexora.dto.request.*;
import dev.hexora.dto.response.ApiResponse;
import dev.hexora.repository.ProfileRepository;
import dev.hexora.service.ProfileService;
import dev.hexora.service.MediaService;
import dev.hexora.enums.MediaType;
import dev.hexora.api.ApiException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Sort;
import org.springframework.web.multipart.MultipartFile;
@RestController @RequestMapping("/api/profile")
public class ProfileController {
 private final ProfileService service;private final ProfileRepository repository;private final MediaService media;
 public ProfileController(ProfileService service,ProfileRepository repository,MediaService media){this.service=service;this.repository=repository;this.media=media;}
 @GetMapping("/public") Object pub(){return ApiResponse.success(service.view(service.latest()));}
 @GetMapping("/public/email/{email}") Object email(@PathVariable String email){return ApiResponse.success(service.view(repository.findByEmail(email).orElseThrow(ApiException::notFound)));}
 @GetMapping("/public/brand/{brand}") Object brand(@PathVariable String brand){return ApiResponse.success(service.view(repository.findByBrandName(brand).orElseThrow(ApiException::notFound)));}
 @GetMapping("/public/search") Object search(@RequestParam String keyword){return ApiResponse.success(repository.findAll(Queries.search(keyword,"fullName","brandName","title")).stream().map(service::view).toList());}
 @GetMapping Object all(){return ApiResponse.success(service.all(Sort.by("createdAt").descending()));}
 @GetMapping("/{id}") Object one(@PathVariable Long id){return ApiResponse.success(service.find(id));}
 @PostMapping @ResponseStatus(org.springframework.http.HttpStatus.CREATED) Object create(@Valid @RequestBody ProfileRequest request){return ApiResponse.created(service.create(request));}
 @PutMapping("/{id}") Object update(@PathVariable Long id,@Valid @RequestBody ProfileRequest request){return ApiResponse.success(service.update(id,request));}
 @PutMapping({"/me","/update"}) Object basic(@Valid @RequestBody ProfileBasicUpdateRequest request){return ApiResponse.success(service.basic(request));}
 @PatchMapping("/{id}/status") Object status(@PathVariable Long id,@RequestParam String status){return ApiResponse.success(service.status(id,status));}
 @PostMapping("/avatar") Object avatar(@RequestParam MultipartFile file){service.latest();var uploaded=media.upload(file,MediaType.IMAGE);return ApiResponse.success(service.avatar(uploaded.getId()));}
 @DeleteMapping("/{id}") ResponseEntity<?> delete(@PathVariable Long id){service.delete(id);return ResponseEntity.noContent().build();}
}
