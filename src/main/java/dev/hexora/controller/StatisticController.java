package dev.hexora.controller;
import dev.hexora.dto.request.StatisticRequest;
import dev.hexora.dto.response.ApiResponse;
import dev.hexora.enums.*;
import dev.hexora.repository.StatisticRepository;
import dev.hexora.service.StatisticService;
import dev.hexora.api.ApiException;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.*;
import java.util.*;
@RestController @RequestMapping("/api/statistics")
public class StatisticController {
 private final StatisticService service;private final StatisticRepository repository;
 public StatisticController(StatisticService service,StatisticRepository repository){this.service=service;this.repository=repository;}
 @GetMapping({"/public",""}) Object all(){return ApiResponse.success(service.all(Sort.by("order")));}
 @GetMapping({"/public/{id}","/{id}"}) Object one(@PathVariable Long id){return ApiResponse.success(service.find(id));}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) Object create(@Valid @RequestBody StatisticRequest request){return ApiResponse.created(service.create(request));}
 @PutMapping("/{id}") Object update(@PathVariable Long id,@Valid @RequestBody StatisticRequest request){return ApiResponse.success(service.update(id,request));}
 @DeleteMapping("/{id}") ResponseEntity<?> delete(@PathVariable Long id){service.delete(id);return ResponseEntity.noContent().build();}

 @GetMapping("/public/title/{title}") Object title(@PathVariable String title){return ApiResponse.success(service.view(repository.findByTitle(title).orElseThrow(ApiException::notFound)));}
 @GetMapping("/public/numeric") Object numeric(){return ApiResponse.success(repository.findAll().stream().filter(s->s.getValue().matches("[-+]?[0-9]+(?:\\.[0-9]+)?")).map(service::view).toList());}
 @GetMapping("/public/sum") Object sum(){return ApiResponse.success(repository.findAll().stream().filter(s->s.getValue().matches("[-+]?[0-9]+(?:\\.[0-9]+)?")).map(s->new java.math.BigDecimal(s.getValue())).reduce(java.math.BigDecimal.ZERO,java.math.BigDecimal::add));}
}
