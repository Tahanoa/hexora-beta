package dev.hexora.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.session.*;
import org.springframework.security.web.context.*;
import org.springframework.security.web.csrf.*;
import org.springframework.security.web.session.HttpSessionEventPublisher;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(12); }
    @Bean AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    @Bean SecurityContextRepository securityContextRepository() { return new HttpSessionSecurityContextRepository(); }
    @Bean CsrfTokenRepository csrfTokenRepository() { return new HttpSessionCsrfTokenRepository(); }
    @Bean SessionRegistry sessionRegistry() { return new SessionRegistryImpl(); }
    @Bean HttpSessionEventPublisher sessionEventPublisher() { return new HttpSessionEventPublisher(); }
    @Bean SessionAuthenticationStrategy sessionAuthenticationStrategy(SessionRegistry registry, CsrfTokenRepository csrf) {
        return new CompositeSessionAuthenticationStrategy(List.of(
                new ChangeSessionIdAuthenticationStrategy(), new CsrfAuthenticationStrategy(csrf),
                new RegisterSessionAuthenticationStrategy(registry)));
    }
    @Bean SecurityFilterChain security(HttpSecurity http, SecurityContextRepository contexts,
                                       CsrfTokenRepository csrf, SessionRegistry registry) throws Exception {
        return http
                .csrf(c -> c.csrfTokenRepository(csrf))
                .securityContext(c -> c.securityContextRepository(contexts).requireExplicitSave(true))
                .authorizeHttpRequests(a -> a
                        .requestMatchers(HttpMethod.GET, "/", "/login", "/register", "/css/**", "/js/**",
                                "/images/**", "/favicon.ico", "/actuator/health", "/api/auth/csrf",
                                "/api/profile/public/**", "/api/projects/public/**", "/api/skills/public/**",
                                "/api/services/public/**", "/api/experience/public/**", "/api/statistics/public/**",
                                "/api/media/public/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register", "/api/contact").permitAll()
                        .requestMatchers("/api/auth/**", "/home").authenticated()
                        .requestMatchers("/dashboard", "/profile", "/manage/**", "/api/**").hasRole("ADMIN")
                        .anyRequest().denyAll())
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((req,res,ex) -> {
                            if (!req.getServletPath().startsWith("/api/")) { res.sendRedirect("/login"); return; }
                            res.setStatus(401);res.setContentType("application/json");
                            res.getWriter().write("{\"success\":false,\"statusCode\":401,\"message\":\"Authentication required\"}");
                        })
                        .accessDeniedHandler((req,res,ex) -> {
                            res.setStatus(403);res.setContentType("application/json");
                            res.getWriter().write("{\"success\":false,\"statusCode\":403,\"message\":\"Access denied or invalid CSRF token\"}");
                        }))
                .formLogin(f -> f.disable()).httpBasic(b -> b.disable())
                .logout(l -> l.logoutUrl("/api/auth/logout").deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((req,res,auth) -> {
                            res.setContentType("application/json");
                            res.getWriter().write("{\"success\":true,\"statusCode\":200,\"message\":\"Logged out\"}");
                        }))
                .sessionManagement(s -> s.maximumSessions(-1).sessionRegistry(registry)
                        .expiredSessionStrategy(event -> {
                            event.getResponse().setStatus(401);
                            event.getResponse().setContentType("application/json");
                            event.getResponse().getWriter().write("{\"success\":false,\"message\":\"Session expired\"}");
                        }))
                .build();
    }
}
