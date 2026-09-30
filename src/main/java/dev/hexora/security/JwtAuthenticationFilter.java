package dev.hexora.security;

import jakarta.servlet.*; import jakarta.servlet.http.*; import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; import org.springframework.security.core.context.SecurityContextHolder; import org.springframework.security.core.userdetails.*; import org.springframework.security.web.authentication.WebAuthenticationDetailsSource; import org.springframework.stereotype.Component; import org.springframework.web.filter.OncePerRequestFilter; import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwt; private final UserDetailsService users;
    public JwtAuthenticationFilter(JwtService jwt, UserDetailsService users) { this.jwt=jwt; this.users=users; }
    @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException { String h=request.getHeader("Authorization"); if(h!=null&&h.regionMatches(true,0,"Bearer ",0,7)&&SecurityContextHolder.getContext().getAuthentication()==null){try{String token=h.substring(7).trim();UserDetails u=users.loadUserByUsername(jwt.username(token));if(jwt.valid(token,u)){var a=new UsernamePasswordAuthenticationToken(u,null,u.getAuthorities());a.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));SecurityContextHolder.getContext().setAuthentication(a);}}catch(RuntimeException ignored){}} chain.doFilter(request,response); }
}
