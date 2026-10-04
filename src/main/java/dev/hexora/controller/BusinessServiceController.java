package dev.hexora.controller;
import dev.hexora.dto.request.ServiceRequest;
import dev.hexora.dto.response.ApiResponse;
import dev.hexora.enums.*;
import dev.hexora.repository.BusinessServiceRepository;
import dev.hexora.service.BusinessServiceService;
import dev.hexora.api.ApiException;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.*;
import java.util.*;
@RestController @RequestMapping("/api/services")
public class BusinessServiceController {
 private final BusinessServiceService service;private final BusinessServiceRepository repository;
 public BusinessServiceController(BusinessServiceService service,BusinessServiceRepository repository){this.service=service;this.repository=repository;}
 @GetMapping("") Object all(){return ApiResponse.success(service.all(Sort.by("order")));}
 @GetMapping("/{id}") Object one(@PathVariable Long id){return ApiResponse.success(service.find(id));}
 @GetMapping("/public") Object published(){return ApiResponse.success(service.published());}
 @GetMapping("/public/{id}") Object publicOne(@PathVariable Long id){return ApiResponse.success(service.publicFind(id));}
 @GetMapping("/public/slug/{slug}") Object publicSlug(@PathVariable String slug){return ApiResponse.success(service.publicSlug(slug));}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) Object create(@Valid @RequestBody ServiceRequest request){return ApiResponse.created(service.create(request));}
 @PutMapping("/{id}") Object update(@PathVariable Long id,@Valid @RequestBody ServiceRequest request){return ApiResponse.success(service.update(id,request));}
 @DeleteMapping("/{id}") ResponseEntity<?> delete(@PathVariable Long id){service.delete(id);return ResponseEntity.noContent().build();}

 @GetMapping("/public/active") Object active(){return ApiResponse.success(service.published());}
 @GetMapping("/public/title/{title}") Object title(@PathVariable String title){return ApiResponse.success(service.publicFind(repository.findByTitle(title).orElseThrow(ApiException::notFound).getId()));}
 @PatchMapping("/{id}/order") Object order(@PathVariable Long id,@RequestParam int order){if(order<0)throw new IllegalArgumentException("Invalid order");var entity=repository.findById(id).orElseThrow(ApiException::notFound);entity.setOrder(order);return ApiResponse.success(service.view(repository.saveAndFlush(entity)));}
}
