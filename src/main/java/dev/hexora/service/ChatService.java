package dev.hexora.service;
import dev.hexora.model.*;
import dev.hexora.repository.*;
import dev.hexora.dto.response.ChatMessageResponse;
import dev.hexora.api.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;
import java.nio.*;
import java.nio.charset.*;
@Service @Transactional
public class ChatService{
 private final ChatMessageRepository messages;private final UserRepository users;
 public ChatService(ChatMessageRepository messages,UserRepository users){this.messages=messages;this.users=users;}
 public User user(String username){return users.findByUsernameIgnoreCase(username).orElseThrow(ApiException::notFound);}
 private User required(Long id){return users.findById(id).orElseThrow(ApiException::notFound);}
 private ChatMessageResponse view(ChatMessage m){return new ChatMessageResponse(m.getId(),m.getText(),m.isFromAdmin(),m.getFileName(),m.getCreatedAt());}
 public List<ChatMessageResponse> history(Long userId,boolean admin,Long after,Long before){
  required(userId);if(after!=null&&before!=null)throw new IllegalArgumentException("Choose one cursor");
  var page=PageRequest.of(0,100);List<ChatMessage> list;
  if(after!=null)list=messages.findByUserIdAndIdGreaterThanOrderByIdAsc(userId,after,page);
  else{list=before==null?messages.findByUserIdOrderByIdDesc(userId,page):messages.findByUserIdAndIdLessThanOrderByIdDesc(userId,before,page);Collections.reverse(list);}
  if(!list.isEmpty())messages.markRead(userId,!admin,list.stream().map(ChatMessage::getId).toList());
  return list.stream().map(this::view).toList();
 }
 public ChatMessageResponse send(Long userId,boolean admin,String text,String fileName){
  User owner=required(userId);if(!admin&&(owner.getPhone()==null||owner.getPhone().isBlank()))throw new ApiException(HttpStatus.FORBIDDEN,"Save your phone number before sending a message");
  if(text==null||text.isBlank()||text.length()>4000)throw new IllegalArgumentException("Message must contain 1–4000 characters");
  ChatMessage message=new ChatMessage();message.setUserId(userId);message.setFromAdmin(admin);message.setText(text.trim());message.setFileName(fileName);return view(messages.saveAndFlush(message));
 }
 public ChatMessageResponse upload(Long userId,boolean admin,MultipartFile file){
  String name=Optional.ofNullable(file.getOriginalFilename()).orElse("");
  if(!name.toLowerCase(Locale.ROOT).endsWith(".txt")||file.isEmpty()||file.getSize()>16000)throw new IllegalArgumentException("Only UTF-8 .txt files up to 16 KB are allowed");
  try{String text=StandardCharsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT).onUnmappableCharacter(CodingErrorAction.REPORT).decode(ByteBuffer.wrap(file.getBytes())).toString();if(text.startsWith("\uFEFF"))text=text.substring(1);if(text.chars().anyMatch(c->Character.isISOControl(c)&&c!='\n'&&c!='\r'&&c!='\t'))throw new IllegalArgumentException("Invalid text file");name=name.replaceAll("[\\/\\\\\r\n]","_");if(name.length()>150)name=name.substring(name.length()-150);var sent=send(userId,admin,text,name);var stored=messages.findById(sent.id()).orElseThrow();stored.setFileData(file.getBytes());messages.saveAndFlush(stored);return sent;}
  catch(java.io.IOException ex){throw new IllegalArgumentException("File must contain valid UTF-8 text");}
 }
 public record Conversation(Long userId,String username,String email,String phone,String lastMessage,java.time.LocalDateTime updatedAt,long unread){}
 @Transactional(readOnly=true) public List<Conversation> conversations(){return messages.conversationUsers().stream().map(id->{User user=required(id);ChatMessage last=messages.findTopByUserIdOrderByIdDesc(id).orElseThrow();return new Conversation(id,user.getUsername(),user.getEmail(),user.getPhone(),last.getText(),last.getCreatedAt(),messages.countByUserIdAndFromAdminAndReadByRecipientFalse(id,false));}).sorted(Comparator.comparing(Conversation::updatedAt).reversed()).toList();}
 public org.springframework.http.ResponseEntity<byte[]> file(Long userId,Long messageId){var message=messages.findById(messageId).orElseThrow(ApiException::notFound);if(!message.getUserId().equals(userId)||message.getFileData()==null)throw ApiException.notFound();return org.springframework.http.ResponseEntity.ok().header("X-Content-Type-Options","nosniff").header("Content-Disposition",org.springframework.http.ContentDisposition.attachment().filename(message.getFileName(),StandardCharsets.UTF_8).build().toString()).cacheControl(org.springframework.http.CacheControl.noStore()).contentType(org.springframework.http.MediaType.parseMediaType("text/plain;charset=UTF-8")).body(message.getFileData());}
 public long total(){return messages.count();}
 public long unread(){return messages.countByFromAdminFalseAndReadByRecipientFalse();}
}
