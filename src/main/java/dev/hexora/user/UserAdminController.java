package dev.hexora.user;
import dev.hexora.dto.response.ApiResponse;
import dev.hexora.enums.RoleType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
@RestController @RequestMapping("/api/users/admin") @PreAuthorize("hasRole('ADMIN')")
public class UserAdminController {
 private final UserAdminService service;
 public UserAdminController(UserAdminService service){this.service=service;}
 public record Update(@NotBlank @Email @Size(max=150) String email,@Size(max=16) @Pattern(regexp="^\\+?[0-9]{8,15}$|^$") String phone,@NotNull Boolean enabled,@NotNull RoleType role,@NotNull @Min(0) Long revision){}
 public record SessionRequest(@NotNull @Min(0) Long revision){}
 @GetMapping Object list(@RequestParam(defaultValue="") String q,@RequestParam(defaultValue="ALL") String state,@RequestParam(required=false) RoleType role,@RequestParam(defaultValue="0") int page){return ApiResponse.success(service.list(q,state,role,page));}
 @GetMapping("/stats") Object stats(){return ApiResponse.success(service.stats());}
 @GetMapping("/{id}") Object detail(@PathVariable Long id){return ApiResponse.success(service.detail(id));}
 @PutMapping("/{id}") Object update(@PathVariable Long id,@Valid @RequestBody Update request,Principal actor){return ApiResponse.success(service.update(id,request,actor.getName()));}
 @PostMapping("/{id}/revoke-sessions") Object revoke(@PathVariable Long id,@Valid @RequestBody SessionRequest request,Principal actor){return ApiResponse.success(service.revoke(id,request.revision(),actor.getName()));}
}
