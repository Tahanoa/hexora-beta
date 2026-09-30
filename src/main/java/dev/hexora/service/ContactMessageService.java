package dev.hexora.service;
import dev.hexora.model.ContactMessage;
import dev.hexora.dto.request.ContactMessageRequest;
import dev.hexora.dto.response.ContactMessageResponse;
import dev.hexora.repository.ContactMessageRepository;
import dev.hexora.enums.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@Transactional
public class ContactMessageService extends CrudService<ContactMessage,ContactMessageRequest,ContactMessageResponse> {
 public ContactMessageService(ContactMessageRepository repository) { super(repository,ContactMessage::new); }
 @Override protected void apply(ContactMessageRequest request,ContactMessage entity) {
  entity.setName(request.getName());
  entity.setEmail(request.getEmail());
  entity.setPhone(request.getPhone());
  entity.setMessage(request.getMessage());
  if(entity.getId()==null) entity.setRead(false);
 }
 @Override public ContactMessageResponse view(ContactMessage entity) {
  ContactMessageResponse response=new ContactMessageResponse();
  response.setId(entity.getId());
  response.setName(entity.getName());
  response.setEmail(entity.getEmail());
  response.setPhone(entity.getPhone());
  response.setMessage(entity.getMessage());
  response.setRead(entity.isRead());
  response.setCreatedAt(entity.getCreatedAt());
  response.setUpdatedAt(entity.getUpdatedAt());
  return response;
 }
}
