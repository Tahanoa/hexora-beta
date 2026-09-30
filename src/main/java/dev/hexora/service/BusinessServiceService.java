package dev.hexora.service;
import dev.hexora.model.BusinessService;
import dev.hexora.dto.request.ServiceRequest;
import dev.hexora.dto.response.ServiceResponse;
import dev.hexora.repository.BusinessServiceRepository;
import dev.hexora.enums.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@Transactional
public class BusinessServiceService extends CrudService<BusinessService,ServiceRequest,ServiceResponse> {
 public BusinessServiceService(BusinessServiceRepository repository) { super(repository,BusinessService::new); }
 @Override protected void apply(ServiceRequest request,BusinessService entity) {
  entity.setTitle(request.getTitle());
  entity.setDescription(request.getDescription());
  entity.setIcon(request.getIcon());
  entity.setFeatures(request.getFeatures());
  entity.setOrder(request.getOrder());
 }
 @Override public ServiceResponse view(BusinessService entity) {
  ServiceResponse response=new ServiceResponse();
  response.setId(entity.getId());
  response.setTitle(entity.getTitle());
  response.setDescription(entity.getDescription());
  response.setIcon(entity.getIcon());
  response.setFeatures(entity.getFeatures());
  response.setOrder(entity.getOrder());
  response.setCreatedAt(entity.getCreatedAt());
  response.setUpdatedAt(entity.getUpdatedAt());
  return response;
 }
}
