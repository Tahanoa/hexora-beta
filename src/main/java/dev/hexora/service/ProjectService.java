package dev.hexora.service;
import dev.hexora.model.Project;
import dev.hexora.dto.request.ProjectRequest;
import dev.hexora.dto.response.ProjectResponse;
import dev.hexora.repository.ProjectRepository;
import dev.hexora.enums.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import dev.hexora.enums.ProjectStatus;
@Service
@Transactional
public class ProjectService extends CrudService<Project,ProjectRequest,ProjectResponse> {
 public ProjectService(ProjectRepository repository) { super(repository,Project::new); }
 @Override protected void apply(ProjectRequest request,Project entity) {
  entity.setTitle(request.getTitle());
  entity.setSlug(request.getSlug());
  entity.setShortDescription(optional(request.getShortDescription()));
  entity.setDescription(optional(request.getDescription()));
  entity.setImage(optional(request.getImage()));
  entity.setDemoUrl(optional(request.getDemoUrl()));
  entity.setGithubUrl(optional(request.getGithubUrl()));
  entity.setClientName(optional(request.getClientName()));
  entity.setStatus(request.getStatus());
  entity.setProjectDate(request.getProjectDate());
 }
 private String optional(String value){return value==null||value.isBlank()?null:value.trim();}
 @Override public ProjectResponse view(Project entity) {
  ProjectResponse response=new ProjectResponse();
  response.setId(entity.getId());
  response.setTitle(entity.getTitle());
  response.setSlug(entity.getSlug());
  response.setShortDescription(entity.getShortDescription());
  response.setDescription(entity.getDescription());
  response.setImage(entity.getImage());
  response.setDemoUrl(entity.getDemoUrl());
  response.setGithubUrl(entity.getGithubUrl());
  response.setClientName(entity.getClientName());
  response.setStatus(entity.getStatus().name());
  response.setProjectDate(entity.getProjectDate());
  response.setCreatedAt(entity.getCreatedAt());
  response.setUpdatedAt(entity.getUpdatedAt());
  return response;
 }
 public ProjectResponse findBySlug(String slug){ return view(((ProjectRepository)repository).findBySlug(slug).orElseThrow(dev.hexora.api.ApiException::notFound)); }
 public java.util.List<ProjectResponse> byStatus(ProjectStatus status){ return ((ProjectRepository)repository).findByStatus(status).stream().map(this::view).toList(); }
 public long count(){return repository.count();} public long countByStatus(ProjectStatus status){return ((ProjectRepository)repository).countByStatus(status);}
}
