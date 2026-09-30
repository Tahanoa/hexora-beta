package dev.hexora.controller;
import dev.hexora.dto.request.ExperienceRequest;
import dev.hexora.dto.response.ApiResponse;
import dev.hexora.enums.*;
import dev.hexora.repository.ExperienceRepository;
import dev.hexora.service.ExperienceService;
import dev.hexora.api.ApiException;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.*;
import java.util.*;
@RestController @RequestMapping("/api/experience")
public class ExperienceController {
 private final ExperienceService service;private final ExperienceRepository repository;
 public ExperienceController(ExperienceService service,ExperienceRepository repository){this.service=service;this.repository=repository;}
 @GetMapping({"/public",""}) Object all(){return ApiResponse.success(service.all(Sort.by("startDate")));}
 @GetMapping({"/public/{id}","/{id}"}) Object one(@PathVariable Long id){return ApiResponse.success(service.find(id));}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) Object create(@Valid @RequestBody ExperienceRequest request){return ApiResponse.created(service.create(request));}
 @PutMapping("/{id}") Object update(@PathVariable Long id,@Valid @RequestBody ExperienceRequest request){return ApiResponse.success(service.update(id,request));}
 @DeleteMapping("/{id}") ResponseEntity<?> delete(@PathVariable Long id){service.delete(id);return ResponseEntity.noContent().build();}

 @GetMapping("/public/current") Object current(){return ApiResponse.success(service.view(repository.findFirstByIsCurrentTrueOrderByStartDateDescIdDesc().orElseThrow(ApiException::notFound)));}
 @GetMapping("/public/past") Object past(){return ApiResponse.success(repository.findByIsCurrentFalseOrderByEndDateDesc().stream().map(service::view).toList());}
 @GetMapping("/public/company/{company}") Object company(@PathVariable String company){return ApiResponse.success(repository.findByCompanyContainingIgnoreCase(company).stream().map(service::view).toList());}
 @GetMapping("/public/date-range") Object range(@RequestParam java.time.LocalDate start,@RequestParam java.time.LocalDate end){if(end.isBefore(start))throw new IllegalArgumentException("Invalid range");return ApiResponse.success(repository.findByStartDateBetween(start,end).stream().map(service::view).toList());}
 @GetMapping("/public/years") Object years(){return ApiResponse.success(repository.findAll().stream().mapToDouble(e->java.time.temporal.ChronoUnit.DAYS.between(e.getStartDate(),e.isCurrent()?java.time.LocalDate.now():e.getEndDate()==null?java.time.LocalDate.now():e.getEndDate())/365.2425).sum());}
}
