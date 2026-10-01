package dev.hexora.controller;
import dev.hexora.api.ApiException;
import dev.hexora.dto.request.ContactMessageRequest;
import dev.hexora.dto.response.ApiResponse;
import dev.hexora.repository.ContactMessageRepository;
import dev.hexora.service.ContactMessageService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@RestController @RequestMapping("/api/contact")
public class ContactController {
 private final ContactMessageService service;private final ContactMessageRepository repository;
 public ContactController(ContactMessageService service,ContactMessageRepository repository){this.service=service;this.repository=repository;}
 @GetMapping Object all(){return ApiResponse.success(service.all(Sort.by("createdAt").descending()));}
 @GetMapping("/unread") Object unread(){return ApiResponse.success(repository.findByIsReadFalseOrderByCreatedAtDesc().stream().map(service::view).toList());}
 @GetMapping("/paged") Object page(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size,@RequestParam(defaultValue="createdAt")String sortBy,@RequestParam(defaultValue="desc")String direction){return ApiResponse.success(service.page(Queries.page(page,size,sortBy,direction,Set.of("id","createdAt","name","email"))));}
 @GetMapping("/search") Object search(@RequestParam String keyword,@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){return ApiResponse.success(repository.findAll(Queries.search(keyword,"name","email","phone","message"),Queries.page(page,size,"createdAt","desc",Set.of("createdAt"))).map(service::view));}
 @GetMapping("/email/{email}") Object email(@PathVariable String email){return ApiResponse.success(repository.findByEmailOrderByCreatedAtDesc(email).stream().map(service::view).toList());}
 @GetMapping("/{id}") Object one(@PathVariable Long id){return ApiResponse.success(service.find(id));}
 @PatchMapping("/{id}/read") Object read(@PathVariable Long id){var entity=repository.findById(id).orElseThrow(ApiException::notFound);entity.setRead(true);repository.saveAndFlush(entity);return ApiResponse.success(null);}
 @PatchMapping("/mark-all-read") @Transactional Object readAll(){var entities=repository.findByIsReadFalseOrderByCreatedAtDesc();entities.forEach(e->e.setRead(true));repository.saveAll(entities);return ApiResponse.success(null);}
 @GetMapping("/stats") Object stats(){long total=repository.count(),unread=repository.countByIsReadFalse();return ApiResponse.success(Map.of("total",total,"unread",unread,"read",total-unread));}
 @DeleteMapping("/{id}") ResponseEntity<?> delete(@PathVariable Long id){service.delete(id);return ResponseEntity.noContent().build();}
 @DeleteMapping("/cleanup/{days}") @Transactional Object cleanup(@PathVariable int days){if(days<1)throw new IllegalArgumentException("Invalid retention");long count=repository.deleteByCreatedAtBefore(java.time.LocalDateTime.now().minusDays(days));return ApiResponse.success(Map.of("deleted",count));}
}
