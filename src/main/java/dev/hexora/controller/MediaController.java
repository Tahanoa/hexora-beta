package dev.hexora.controller;
import dev.hexora.api.ApiException;
import dev.hexora.enums.MediaType;
import dev.hexora.repository.MediaRepository;
import dev.hexora.service.MediaService;
import dev.hexora.dto.response.ApiResponse;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.*;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
@RestController @RequestMapping("/api/media")
public class MediaController {
 private final MediaRepository repository;private final MediaService service;
 public MediaController(MediaRepository repository,MediaService service){this.repository=repository;this.service=service;}
 @GetMapping("/public/{id}") ResponseEntity<byte[]> file(@PathVariable Long id){var m=repository.findById(id).orElseThrow(ApiException::notFound);return ResponseEntity.ok().header("X-Content-Type-Options","nosniff").header("Content-Disposition",(m.getType()==MediaType.IMAGE?ContentDisposition.inline():ContentDisposition.attachment()).filename(m.getFileName(),StandardCharsets.UTF_8).build().toString()).cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic()).contentType(org.springframework.http.MediaType.parseMediaType(m.getContentType())).body(m.getData());}
 @GetMapping("/public/info/{id}") Object info(@PathVariable Long id){return ApiResponse.success(service.info(repository.findById(id).orElseThrow(ApiException::notFound)));}
 @GetMapping("/public/name/{fileName}") Object name(@PathVariable String fileName){return ApiResponse.success(service.info(repository.findByFileName(fileName).orElseThrow(ApiException::notFound)));}
 @GetMapping("/public/base64/{id}") Object base64(@PathVariable Long id){var m=repository.findById(id).orElseThrow(ApiException::notFound);return ApiResponse.success("data:"+m.getContentType()+";base64,"+Base64.getEncoder().encodeToString(m.getData()));}
 @PostMapping("/upload") @ResponseStatus(HttpStatus.CREATED) Object upload(@RequestParam MultipartFile file,@RequestParam(defaultValue="IMAGE")MediaType type){return ApiResponse.created(service.info(service.upload(file,type)));}
 @PostMapping("/upload/image") @ResponseStatus(HttpStatus.CREATED) Object image(@RequestParam MultipartFile file){return ApiResponse.created(service.info(service.upload(file,MediaType.IMAGE)));}
 @PostMapping("/upload/document") @ResponseStatus(HttpStatus.CREATED) Object document(@RequestParam MultipartFile file){return ApiResponse.created(service.info(service.upload(file,MediaType.DOCUMENT)));}
 @PutMapping("/{id}") Object update(@PathVariable Long id,@RequestParam MultipartFile file){return ApiResponse.success(service.info(service.update(id,file)));}
 @GetMapping Object all(){return ApiResponse.success(repository.findAll(Sort.by("createdAt").descending()).stream().map(service::info).toList());}
 @GetMapping("/type/{type}") Object type(@PathVariable MediaType type){return ApiResponse.success(repository.findByTypeOrderByCreatedAtDesc(type).stream().map(service::info).toList());}
 @GetMapping("/recent") Object recent(@RequestParam(defaultValue="10")int limit){if(limit<1||limit>100)throw new IllegalArgumentException("Invalid limit");return ApiResponse.success(repository.findAll(PageRequest.of(0,limit,Sort.by("createdAt").descending())).map(service::info).getContent());}
 @GetMapping("/stats") Object stats(){var list=repository.findAll();return ApiResponse.success(Map.of("total",list.size(),"totalSize",list.stream().mapToLong(m->m.getSize()).sum()));}
 @DeleteMapping("/{id}") ResponseEntity<?> delete(@PathVariable Long id){repository.delete(repository.findById(id).orElseThrow(ApiException::notFound));return ResponseEntity.noContent().build();}
}
