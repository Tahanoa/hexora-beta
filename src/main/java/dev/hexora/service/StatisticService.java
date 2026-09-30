package dev.hexora.service;
import dev.hexora.model.Statistic;
import dev.hexora.dto.request.StatisticRequest;
import dev.hexora.dto.response.StatisticResponse;
import dev.hexora.repository.StatisticRepository;
import dev.hexora.enums.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@Transactional
public class StatisticService extends CrudService<Statistic,StatisticRequest,StatisticResponse> {
 public StatisticService(StatisticRepository repository) { super(repository,Statistic::new); }
 @Override protected void apply(StatisticRequest request,Statistic entity) {
  entity.setTitle(request.getTitle());
  entity.setValue(request.getValue());
  entity.setIcon(request.getIcon());
  entity.setOrder(request.getOrder());
 }
 @Override public StatisticResponse view(Statistic entity) {
  StatisticResponse response=new StatisticResponse();
  response.setId(entity.getId());
  response.setTitle(entity.getTitle());
  response.setValue(entity.getValue());
  response.setIcon(entity.getIcon());
  response.setOrder(entity.getOrder());
  response.setCreatedAt(entity.getCreatedAt());
  response.setUpdatedAt(entity.getUpdatedAt());
  return response;
 }
}
