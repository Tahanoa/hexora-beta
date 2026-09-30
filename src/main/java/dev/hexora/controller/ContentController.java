package dev.hexora.controller;
import dev.hexora.dto.request.*; import dev.hexora.service.*; import jakarta.validation.Valid; import org.springframework.http.*; import org.springframework.web.bind.annotation.*; import org.springframework.data.domain.Sort; import java.util.*;
@RestController
public class ContentController {
 private final SkillService skills; private final BusinessServiceService services; private final StatisticService statistics; private final ExperienceService experience; private final ContactMessageService contact;
 public ContentController(SkillService skills,BusinessServiceService services,StatisticService statistics,ExperienceService experience,ContactMessageService contact){this.skills=skills;this.services=services;this.statistics=statistics;this.experience=experience;this.contact=contact;}
 @GetMapping("/api/skills/public") Object skills(){return dev.hexora.dto.response.ApiResponse.success(skills.all(Sort.by("level").descending()));}
 @GetMapping("/api/services/public") Object services(){return dev.hexora.dto.response.ApiResponse.success(services.all(Sort.by("order").ascending()));}
 @GetMapping("/api/statistics/public") Object statistics(){return dev.hexora.dto.response.ApiResponse.success(statistics.all(Sort.by("order").ascending()));}
 @GetMapping("/api/experience/public") Object experience(){return dev.hexora.dto.response.ApiResponse.success(experience.all(Sort.by("startDate").descending()));}
 @PostMapping("/api/contact") Object contact(@Valid @RequestBody ContactMessageRequest r){return dev.hexora.dto.response.ApiResponse.created(contact.create(r));}
 @GetMapping("/api/contact") Object contacts(){return dev.hexora.dto.response.ApiResponse.success(contact.all(Sort.by("createdAt").descending()));}
 @PostMapping("/api/skills") Object skill(@Valid @RequestBody SkillRequest r){return dev.hexora.dto.response.ApiResponse.created(skills.create(r));}
 @PutMapping("/api/skills/{id}") Object skill(@PathVariable Long id,@Valid @RequestBody SkillRequest r){return dev.hexora.dto.response.ApiResponse.success(skills.update(id,r));}
 @DeleteMapping("/api/skills/{id}") ResponseEntity<?> skill(@PathVariable Long id){skills.delete(id);return ResponseEntity.noContent().build();}
 @PostMapping("/api/services") Object service(@Valid @RequestBody ServiceRequest r){return dev.hexora.dto.response.ApiResponse.created(services.create(r));}
 @PutMapping("/api/services/{id}") Object service(@PathVariable Long id,@Valid @RequestBody ServiceRequest r){return dev.hexora.dto.response.ApiResponse.success(services.update(id,r));}
 @DeleteMapping("/api/services/{id}") ResponseEntity<?> service(@PathVariable Long id){services.delete(id);return ResponseEntity.noContent().build();}
 @PostMapping("/api/statistics") Object statistic(@Valid @RequestBody StatisticRequest r){return dev.hexora.dto.response.ApiResponse.created(statistics.create(r));}
 @PutMapping("/api/statistics/{id}") Object statistic(@PathVariable Long id,@Valid @RequestBody StatisticRequest r){return dev.hexora.dto.response.ApiResponse.success(statistics.update(id,r));}
 @DeleteMapping("/api/statistics/{id}") ResponseEntity<?> statistic(@PathVariable Long id){statistics.delete(id);return ResponseEntity.noContent().build();}
 @PostMapping("/api/experience") Object exp(@Valid @RequestBody ExperienceRequest r){return dev.hexora.dto.response.ApiResponse.created(experience.create(r));}
 @PutMapping("/api/experience/{id}") Object exp(@PathVariable Long id,@Valid @RequestBody ExperienceRequest r){return dev.hexora.dto.response.ApiResponse.success(experience.update(id,r));}
 @DeleteMapping("/api/experience/{id}") ResponseEntity<?> exp(@PathVariable Long id){experience.delete(id);return ResponseEntity.noContent().build();}
}
