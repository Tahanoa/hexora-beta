package dev.hexora.controller;
import dev.hexora.service.TestimonialService;
import dev.hexora.dto.request.TestimonialRequest;
import dev.hexora.dto.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.data.domain.Sort;
@RestController @RequestMapping("/api/testimonials")
public class TestimonialController{
 private final TestimonialService service;
 public TestimonialController(TestimonialService service){this.service=service;}
 @GetMapping("/public") Object published(){return ApiResponse.success(service.published());}
 @GetMapping Object all(){return ApiResponse.success(service.all(Sort.by("order").ascending().and(Sort.by("id").descending())));}
 @GetMapping("/{id}") Object one(@PathVariable Long id){return ApiResponse.success(service.find(id));}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) Object create(@Valid @RequestBody TestimonialRequest request){return ApiResponse.created(service.create(request));}
 @PutMapping("/{id}") Object update(@PathVariable Long id,@Valid @RequestBody TestimonialRequest request){return ApiResponse.success(service.update(id,request));}
 @DeleteMapping("/{id}") ResponseEntity<?> delete(@PathVariable Long id){service.delete(id);return ResponseEntity.noContent().build();}
}
