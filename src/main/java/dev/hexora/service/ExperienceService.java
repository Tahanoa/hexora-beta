package dev.hexora.service;
import dev.hexora.model.Experience;
import dev.hexora.dto.request.ExperienceRequest;
import dev.hexora.dto.response.ExperienceResponse;
import dev.hexora.repository.ExperienceRepository;
import dev.hexora.enums.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@Transactional
public class ExperienceService extends CrudService<Experience,ExperienceRequest,ExperienceResponse> {
 public ExperienceService(ExperienceRepository repository) { super(repository,Experience::new); }
 @Override protected void apply(ExperienceRequest request,Experience entity) {
  if (request.getEndDate()!=null && request.getEndDate().isBefore(request.getStartDate())) throw new IllegalArgumentException("End date precedes start date");
  if (Boolean.TRUE.equals(request.getIsCurrent()) && request.getEndDate()!=null) throw new IllegalArgumentException("Current experience cannot have end date");
  entity.setCompany(request.getCompany());
  entity.setPosition(request.getPosition());
  entity.setDescription(request.getDescription());
  entity.setStartDate(request.getStartDate());
  entity.setEndDate(request.getEndDate());
  entity.setCurrent(Boolean.TRUE.equals(request.getIsCurrent()));
 }
 @Override public ExperienceResponse view(Experience entity) {
  ExperienceResponse response=new ExperienceResponse();
  response.setId(entity.getId());
  response.setCompany(entity.getCompany());
  response.setPosition(entity.getPosition());
  response.setDescription(entity.getDescription());
  response.setStartDate(entity.getStartDate());
  response.setEndDate(entity.getEndDate());
  response.setIsCurrent(entity.isCurrent());
  response.setCreatedAt(entity.getCreatedAt());
  response.setUpdatedAt(entity.getUpdatedAt());
  return response;
 }
}
