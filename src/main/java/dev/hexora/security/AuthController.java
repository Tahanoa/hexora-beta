package dev.hexora.security;

import dev.hexora.api.ApiException;
import dev.hexora.dto.request.ChangePasswordRequest;
import dev.hexora.dto.response.ApiResponse;
import dev.hexora.enums.RoleType;
import dev.hexora.model.User;
import dev.hexora.repository.RoleRepository;
import dev.hexora.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager manager;
    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordEncoder encoder;
    private final SecurityContextRepository contexts;
    private final SessionAuthenticationStrategy sessionStrategy;
    private final SessionRegistry sessions;
    private final boolean registrationEnabled;

    public AuthController(AuthenticationManager manager, UserRepository users, RoleRepository roles,
                          PasswordEncoder encoder, SecurityContextRepository contexts,
                          SessionAuthenticationStrategy sessionStrategy, SessionRegistry sessions,
                          @Value("${app.registration-enabled}") boolean registrationEnabled) {
        this.manager=manager;this.users=users;this.roles=roles;this.encoder=encoder;
        this.contexts=contexts;this.sessionStrategy=sessionStrategy;this.sessions=sessions;
        this.registrationEnabled=registrationEnabled;
    }
    @GetMapping("/csrf") public Map<String,String> csrf(CsrfToken token) {
        return Map.of("headerName",token.getHeaderName(),"token",token.getToken());
    }
    @GetMapping("/me") public ApiResponse<?> me(Authentication authentication) {
        return ApiResponse.success(userInfo(users.findByUsernameIgnoreCase(authentication.getName()).orElseThrow(ApiException::notFound)));
    }
    @PostMapping("/register") public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if(!registrationEnabled) throw new ApiException(HttpStatus.FORBIDDEN,"Registration is disabled");
        String username=request.username().trim().toLowerCase(Locale.ROOT);
        String email=request.email().trim().toLowerCase(Locale.ROOT);
        if(!username.matches("[a-z0-9_.-]{3,50}")) throw new IllegalArgumentException("Invalid username");
        checkPassword(request.password());
        if(users.existsByUsernameIgnoreCase(username)||users.existsByEmailIgnoreCase(email))
            throw new ApiException(HttpStatus.CONFLICT,"Username or email is already in use");
        User user=new User();user.setUsername(username);user.setEmail(email);
        user.setPassword(encoder.encode(request.password()));
        user.setRoles(Set.of(roles.findByName(RoleType.USER).orElseThrow()));
        users.saveAndFlush(user);
        return ResponseEntity.status(201).body(ApiResponse.created("Registered successfully",null));
    }
    @PostMapping("/login") public ApiResponse<?> login(@Valid @RequestBody LoginRequest request,
                                                     HttpServletRequest req,HttpServletResponse res) {
        Authentication auth=manager.authenticate(new UsernamePasswordAuthenticationToken(request.usernameOrEmail().trim(),request.password()));
        sessionStrategy.onAuthentication(auth,req,res);
        var context=SecurityContextHolder.createEmptyContext();context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        contexts.saveContext(context,req,res);
        return ApiResponse.success("Login successful",userInfo(users.findByUsernameIgnoreCase(auth.getName()).orElseThrow()));
    }
    @PostMapping("/change-password") public ApiResponse<?> change(@Valid @RequestBody ChangePasswordRequest request,
                                                                 Authentication auth,HttpServletRequest req) {
        User user=users.findByUsernameIgnoreCase(auth.getName()).orElseThrow(ApiException::notFound);
        if(!encoder.matches(request.getCurrentPassword(),user.getPassword()))
            throw new ApiException(HttpStatus.BAD_REQUEST,"Current password is incorrect");
        checkPassword(request.getNewPassword());
        user.setPassword(encoder.encode(request.getNewPassword()));users.saveAndFlush(user);
        // Expire every registered session for this principal, including sessions on other browsers.
        sessions.getAllSessions(auth.getPrincipal(),false).forEach(s -> s.expireNow());
        if(req.getSession(false)!=null) req.getSession(false).invalidate();
        SecurityContextHolder.clearContext();
        return ApiResponse.success("Password changed. Please sign in again.",null);
    }
    static void checkPassword(String password) {
        if(password==null||password.length()<8||password.getBytes(StandardCharsets.UTF_8).length>72)
            throw new IllegalArgumentException("Password must be at least 8 characters and at most 72 UTF-8 bytes");
    }
    private Map<String,Object> userInfo(User user) {
        return Map.of("id",user.getId(),"username",user.getUsername(),"email",user.getEmail(),
                "roles",user.getRoles().stream().map(r->r.getName().name()).toList(),"createdAt",user.getCreatedAt());
    }
}
