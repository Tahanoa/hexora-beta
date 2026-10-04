package dev.hexora.controller;
import dev.hexora.service.ChatService;
import dev.hexora.dto.response.ApiResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.Map;
@RestController @RequestMapping("/api/chat")
public class ChatController{
 private final ChatService service;public ChatController(ChatService service){this.service=service;}
 public record MessageRequest(@NotBlank @Size(max=4000) String text,@Positive Long serviceId){}
 @GetMapping("/files/{messageId}") org.springframework.http.ResponseEntity<byte[]> download(Authentication auth,@PathVariable Long messageId){return service.file(service.user(auth.getName()).getId(),messageId);}
 @PreAuthorize("hasRole('ADMIN')") @GetMapping("/admin/{userId}/files/{messageId}") org.springframework.http.ResponseEntity<byte[]> adminDownload(@PathVariable Long userId,@PathVariable Long messageId){return service.file(userId,messageId);}
 @GetMapping("/messages") Object history(Authentication auth,@RequestParam(required=false)Long after,@RequestParam(required=false)Long before){return ApiResponse.success(service.history(service.user(auth.getName()).getId(),false,after,before));}
 @PostMapping("/messages") Object send(Authentication auth,@Valid @RequestBody MessageRequest request){return ApiResponse.created(service.sendRequest(service.user(auth.getName()).getId(),request.text(),request.serviceId()));}
 @PostMapping("/files") Object file(Authentication auth,@RequestParam MultipartFile file){return ApiResponse.created(service.upload(service.user(auth.getName()).getId(),false,file));}
 @PreAuthorize("hasRole('ADMIN')") @GetMapping("/admin/conversations") Object conversations(){return ApiResponse.success(service.conversations());}
 @PreAuthorize("hasRole('ADMIN')") @GetMapping("/admin/stats") Object stats(){return ApiResponse.success(Map.of("unread",service.unread(),"total",service.total()));}
 @PreAuthorize("hasRole('ADMIN')") @GetMapping("/admin/{userId}/messages") Object adminHistory(@PathVariable Long userId,@RequestParam(required=false)Long after,@RequestParam(required=false)Long before){return ApiResponse.success(service.history(userId,true,after,before));}
 @PreAuthorize("hasRole('ADMIN')") @PostMapping("/admin/{userId}/messages") Object reply(@PathVariable Long userId,@Valid @RequestBody MessageRequest request){return ApiResponse.created(service.send(userId,true,request.text(),null));}
 @PreAuthorize("hasRole('ADMIN')") @PostMapping("/admin/{userId}/files") Object adminFile(@PathVariable Long userId,@RequestParam MultipartFile file){return ApiResponse.created(service.upload(userId,true,file));}
}
