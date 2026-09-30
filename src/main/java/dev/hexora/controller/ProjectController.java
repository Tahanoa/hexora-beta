package dev.hexora.controller;
import dev.hexora.dto.request.ProjectRequest;
import dev.hexora.dto.response.ApiResponse;
import dev.hexora.enums.ProjectStatus;
import dev.hexora.repository.ProjectRepository;
import dev.hexora.service.ProjectService;
import dev.hexora.api.ApiException;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.*;
import java.time.LocalDateTime;
import java.util.*;
@RestController @RequestMapping("/api/projects")
public class ProjectController {
 private final ProjectService service;private final ProjectRepository repository;
 public ProjectController(ProjectService service,ProjectRepository repository){this.service=service;this.repository=repository;}
 @GetMapping({"/public",""}) Object all(){return ApiResponse.success(service.all(Sort.by("projectDate").descending().and(Sort.by("id").descending())));}
 @GetMapping("/{id}") Object one(@PathVariable Long id){return ApiResponse.success(service.find(id));}
 @GetMapping("/public/{slug}") Object slug(@PathVariable String slug){return ApiResponse.success(service.findBySlug(slug));}
 @GetMapping("/public/status/{status}") Object status(@PathVariable String status){return ApiResponse.success(service.byStatus(ProjectStatus.fromString(status)));}
 @GetMapping("/public/completed") Object completed(){return ApiResponse.success(service.byStatus(ProjectStatus.COMPLETED));}
 @GetMapping("/public/recent") Object recent(@RequestParam(defaultValue="6") int limit){if(limit<1||limit>100)throw new IllegalArgumentException("Invalid limit");return ApiResponse.success(service.page(PageRequest.of(0,limit,Sort.by("projectDate").descending())).getContent());}
 @GetMapping("/public/search") Object search(@RequestParam String keyword,@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="10")int size,@RequestParam(defaultValue="projectDate")String sortBy,@RequestParam(defaultValue="desc")String direction){return ApiResponse.success(repository.findAll(Queries.search(keyword,"title","description","shortDescription","clientName"),Queries.page(page,size,sortBy,direction,Set.of("projectDate","createdAt","title","id"))).map(service::view));}
 @GetMapping("/public/date-range") Object range(@RequestParam LocalDateTime start,@RequestParam LocalDateTime end,@RequestParam(required=false)String status){if(end.isBefore(start))throw new IllegalArgumentException("Invalid range");var selected=status==null?null:ProjectStatus.fromString(status);return ApiResponse.success(repository.findByProjectDateBetween(start,end).stream().filter(p->selected==null||p.getStatus()==selected).map(service::view).toList());}
 @GetMapping("/public/stats") Object stats(){return ApiResponse.success(Map.of("total",service.count(),"completed",service.countByStatus(ProjectStatus.COMPLETED),"inProgress",service.countByStatus(ProjectStatus.IN_PROGRESS),"planning",service.countByStatus(ProjectStatus.PLANNING)));}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) Object create(@Valid @RequestBody ProjectRequest request){return ApiResponse.created(service.create(request));}
 @PutMapping("/{id}") Object update(@PathVariable Long id,@Valid @RequestBody ProjectRequest request){return ApiResponse.success(service.update(id,request));}
 @DeleteMapping("/{id}") ResponseEntity<?> delete(@PathVariable Long id){service.delete(id);return ResponseEntity.noContent().build();}
}
