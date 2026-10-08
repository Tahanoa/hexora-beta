package dev.hexora.security;

import dev.hexora.api.ApiException; import dev.hexora.dto.request.ChangePasswordRequest; import dev.hexora.dto.response.ApiResponse; import dev.hexora.enums.RoleType; import dev.hexora.model.User; import dev.hexora.repository.RoleRepository; import dev.hexora.repository.UserRepository; import jakarta.validation.Valid; import org.springframework.beans.factory.annotation.Value; import org.springframework.http.*; import org.springframework.security.authentication.*; import org.springframework.security.core.*; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.web.bind.annotation.*; import java.nio.charset.StandardCharsets; import java.util.*;

@RestController @RequestMapping("/api/auth")
public class AuthController {
 private final AuthenticationManager manager; private final UserRepository users; private final RoleRepository roles; private final PasswordEncoder encoder; private final JwtService jwt; private final boolean registrationEnabled;private final RequestLimits limits;private final jakarta.persistence.EntityManager entityManager;private final org.springframework.transaction.support.TransactionTemplate transaction;
 public AuthController(AuthenticationManager manager,UserRepository users,RoleRepository roles,PasswordEncoder encoder,JwtService jwt,@Value("${app.registration-enabled}")boolean registrationEnabled,RequestLimits limits,jakarta.persistence.EntityManager entityManager,org.springframework.transaction.PlatformTransactionManager transactionManager){this.manager=manager;this.users=users;this.roles=roles;this.encoder=encoder;this.jwt=jwt;this.registrationEnabled=registrationEnabled;this.limits=limits;this.entityManager=entityManager;this.transaction=new org.springframework.transaction.support.TransactionTemplate(transactionManager);}
 @GetMapping("/csrf") public Map<String,String> csrf(){return Map.of("mode","bearer-jwt");}
 @GetMapping("/me") public ApiResponse<?> me(Authentication auth){return ApiResponse.success(userInfo(users.findByUsernameIgnoreCase(auth.getName()).orElseThrow(ApiException::notFound)));}
 public record PhoneRequest(@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Pattern(regexp="^\\+?[0-9]{8,15}$") String phone){}
 @PatchMapping("/phone") @org.springframework.transaction.annotation.Transactional public ApiResponse<?> phone(@Valid @RequestBody PhoneRequest request,Authentication auth){User user=users.lockedByUsername(auth.getName()).orElseThrow(ApiException::notFound);user.setPhone(request.phone());users.saveAndFlush(user);return ApiResponse.success(userInfo(user));}
 @PostMapping("/register") public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request){if(!registrationEnabled)throw new ApiException(HttpStatus.FORBIDDEN,"Registration is disabled");String username=request.username().trim().toLowerCase(Locale.ROOT),email=request.email().trim().toLowerCase(Locale.ROOT);if(!username.matches("[a-z0-9_.-]{3,50}"))throw new IllegalArgumentException("Invalid username");checkPassword(request.password());if(users.existsByUsernameIgnoreCase(username)||users.existsByEmailIgnoreCase(email))throw new ApiException(HttpStatus.CONFLICT,"Username or email is already in use");User user=new User();user.setUsername(username);user.setEmail(email);user.setPassword(encoder.encode(request.password()));user.setRoles(Set.of(roles.findByName(RoleType.USER).orElseThrow()));users.saveAndFlush(user);return ResponseEntity.status(201).body(ApiResponse.created("Registered successfully",null));}
 @PostMapping("/login") public ApiResponse<?> login(@Valid @RequestBody LoginRequest request){
  String login=request.usernameOrEmail().trim().toLowerCase(Locale.ROOT);
  String identity=users.findByUsernameIgnoreCase(login).or(()->users.findByEmailIgnoreCase(login)).map(u->"user:"+u.getId()).orElse("login:"+login);
  limits.take("login-account",identity,10,900);limits.checkLogin(identity);
  Authentication auth;try{auth=manager.authenticate(new UsernamePasswordAuthenticationToken(login,request.password()));}catch(AuthenticationException e){limits.failedLogin(identity);throw e;}
  ApiResponse<?> result=transaction.execute(status->{
  User user=users.lockedByUsername(auth.getName()).orElseThrow(ApiException::notFound);
  entityManager.refresh(user,jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
  if(!user.isEnabled()||!encoder.matches(request.password(),user.getPassword()))throw new BadCredentialsException("Invalid credentials");
  return ApiResponse.success("Login successful",Map.of("accessToken",jwt.create(user),"tokenType","Bearer","expiresIn",jwt.ttlSeconds(),"user",userInfo(user)));
  });
  limits.loginSucceeded(identity);return result;
 }
 @PostMapping("/logout") public ApiResponse<?> logout(@RequestHeader("Authorization") String authorization){jwt.revoke(authorization.substring(7).trim());return ApiResponse.success("Logged out",null);}
 @PostMapping("/change-password") @org.springframework.transaction.annotation.Transactional public ApiResponse<?> change(@Valid @RequestBody ChangePasswordRequest request,Authentication auth){User user=users.lockedByUsername(auth.getName()).orElseThrow(ApiException::notFound);if(!encoder.matches(request.getCurrentPassword(),user.getPassword()))throw new ApiException(HttpStatus.BAD_REQUEST,"Current password is incorrect");checkPassword(request.getNewPassword());user.setPassword(encoder.encode(request.getNewPassword()));user.setTokenVersion(user.getTokenVersion()+1);users.saveAndFlush(user);return ApiResponse.success("Password changed. Please sign in again.",null);}
 static void checkPassword(String password){if(password==null||password.length()<8||password.getBytes(StandardCharsets.UTF_8).length>72)throw new IllegalArgumentException("Password must be at least 8 characters and at most 72 UTF-8 bytes");}
 private Map<String,Object> userInfo(User u){return Map.of("id",u.getId(),"username",u.getUsername(),"email",u.getEmail(),"phone",u.getPhone()==null?"":u.getPhone(),"roles",u.getRoles().stream().map(r->r.getName().name()).toList(),"createdAt",u.getCreatedAt());}
}
