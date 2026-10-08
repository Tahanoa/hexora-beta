package dev.hexora.security;
import dev.hexora.api.ApiException;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;
import org.springframework.core.Ordered;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
@Component @Order(Ordered.HIGHEST_PRECEDENCE+10)
public class AuthRequestLimitFilter extends OncePerRequestFilter {
 private final RequestLimits limits;
 public AuthRequestLimitFilter(RequestLimits limits){this.limits=limits;}
 @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException{
  String path=request.getServletPath();
  if("POST".equals(request.getMethod())&&(path.equals("/api/auth/login")||path.equals("/api/auth/register"))){
   try{limits.take(path,request.getRemoteAddr(),path.endsWith("login")?30:5,path.endsWith("login")?900:3600);}
   catch(ApiException e){response.setStatus(429);response.setHeader("Retry-After","60");response.setContentType("application/json;charset=UTF-8");response.getWriter().write("{\"success\":false,\"statusCode\":429,\"message\":\"Too many requests; try again later\"}");return;}
  }
  chain.doFilter(request,response);
 }
}
