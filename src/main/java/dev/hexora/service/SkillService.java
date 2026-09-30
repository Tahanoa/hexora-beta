package dev.hexora.service;
import dev.hexora.model.Skill;
import dev.hexora.dto.request.SkillRequest;
import dev.hexora.dto.response.SkillResponse;
import dev.hexora.repository.SkillRepository;
import dev.hexora.enums.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@Transactional
public class SkillService extends CrudService<Skill,SkillRequest,SkillResponse> {
 public SkillService(SkillRepository repository) { super(repository,Skill::new); }
 @Override protected void apply(SkillRequest request,Skill entity) {
  entity.setName(request.getName());
  entity.setCategory(request.getCategory());
  entity.setLevel(request.getLevel());
  entity.setIcon(request.getIcon());
  entity.setDescription(request.getDescription());
 }
 @Override public SkillResponse view(Skill entity) {
  SkillResponse response=new SkillResponse();
  response.setId(entity.getId());
  response.setName(entity.getName());
  response.setCategory(entity.getCategory().name());
  response.setLevel(entity.getLevel());
  response.setIcon(entity.getIcon());
  response.setDescription(entity.getDescription());
  response.setCreatedAt(entity.getCreatedAt());
  response.setUpdatedAt(entity.getUpdatedAt());
  return response;
 }
}
