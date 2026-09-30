package dev.hexora.controller;
import dev.hexora.dto.request.SkillRequest;
import dev.hexora.dto.response.ApiResponse;
import dev.hexora.enums.*;
import dev.hexora.repository.SkillRepository;
import dev.hexora.service.SkillService;
import dev.hexora.api.ApiException;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.*;
import java.util.*;
@RestController @RequestMapping("/api/skills")
public class SkillController {
 private final SkillService service;private final SkillRepository repository;
 public SkillController(SkillService service,SkillRepository repository){this.service=service;this.repository=repository;}
 @GetMapping({"/public",""}) Object all(){return ApiResponse.success(service.all(Sort.by("level")));}
 @GetMapping({"/public/{id}","/{id}"}) Object one(@PathVariable Long id){return ApiResponse.success(service.find(id));}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) Object create(@Valid @RequestBody SkillRequest request){return ApiResponse.created(service.create(request));}
 @PutMapping("/{id}") Object update(@PathVariable Long id,@Valid @RequestBody SkillRequest request){return ApiResponse.success(service.update(id,request));}
 @DeleteMapping("/{id}") ResponseEntity<?> delete(@PathVariable Long id){service.delete(id);return ResponseEntity.noContent().build();}

 @GetMapping("/public/category/{category}") Object category(@PathVariable String category){return ApiResponse.success(repository.findByCategoryOrderByLevelDesc(Queries.enumValue(SkillCategory.class,category)).stream().map(service::view).toList());}
 @GetMapping("/public/categories") Object categories(){return ApiResponse.success(Arrays.stream(SkillCategory.values()).map(Enum::name).toList());}
 @GetMapping("/public/categories/stats") Object stats(){return ApiResponse.success(repository.findAll().stream().collect(java.util.stream.Collectors.groupingBy(s->s.getCategory().name(),java.util.stream.Collectors.counting())));}
 @GetMapping("/public/top") Object top(@RequestParam(defaultValue="80")int minLevel){if(minLevel<0||minLevel>100)throw new IllegalArgumentException("Invalid level");return ApiResponse.success(repository.findAll(Sort.by("level").descending()).stream().filter(s->s.getLevel()>=minLevel).map(service::view).toList());}
 @GetMapping("/public/search") Object search(@RequestParam String keyword){return ApiResponse.success(repository.findAll(Queries.search(keyword,"name","description")).stream().map(service::view).toList());}
}
