package dev.hexora.config;

import dev.hexora.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(12); }
    @Bean AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception { return config.getAuthenticationManager(); }
    @Bean SecurityFilterChain security(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
        return http.csrf(c -> c.disable()).cors(c -> {}).sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .securityContext(s -> s.requireExplicitSave(false))
                .authorizeHttpRequests(a -> a
                        .requestMatchers(HttpMethod.GET, "/", "/about", "/experience", "/projects", "/projects/*", "/collaboration", "/services", "/skills", "/contact", "/login", "/register", "/home", "/dashboard", "/profile", "/manage/**", "/css/**", "/js/**", "/data/fontawesome-icons.json", "/images/**", "/favicon.ico", "/actuator/health", "/api/auth/csrf", "/api/profile/public/**", "/api/projects/public/**", "/api/skills/public/**", "/api/services/public/**", "/api/experience/public/**", "/api/statistics/public/**", "/api/media/public/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register", "/api/contact").permitAll()
                        .requestMatchers("/api/auth/**").authenticated().requestMatchers("/api/**").hasRole("ADMIN").anyRequest().denyAll())
                .exceptionHandling(e -> e.authenticationEntryPoint((req,res,ex) -> { if (!req.getServletPath().startsWith("/api/")) { res.sendRedirect("/login"); return; } res.setStatus(401); res.setContentType("application/json"); res.getWriter().write("{\"success\":false,\"statusCode\":401,\"message\":\"Authentication required\"}"); })
                        .accessDeniedHandler((req,res,ex) -> { res.setStatus(403); res.setContentType("application/json"); res.getWriter().write("{\"success\":false,\"statusCode\":403,\"message\":\"Access denied\"}"); }))
                .formLogin(f -> f.disable()).httpBasic(b -> b.disable()).logout(l -> l.disable())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class).build();
    }
}
