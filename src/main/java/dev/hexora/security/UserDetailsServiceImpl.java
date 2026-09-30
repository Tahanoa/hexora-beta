package dev.hexora.security;
import dev.hexora.model.User; import dev.hexora.repository.UserRepository; import org.springframework.security.core.authority.SimpleGrantedAuthority; import org.springframework.security.core.userdetails.*; import org.springframework.stereotype.Service; import java.util.stream.Collectors;
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
 private final UserRepository users; public UserDetailsServiceImpl(UserRepository users){this.users=users;}
 public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException { User u=users.findByUsernameIgnoreCase(login).or(()->users.findByEmailIgnoreCase(login)).orElseThrow(()->new UsernameNotFoundException("Invalid credentials")); return new org.springframework.security.core.userdetails.User(u.getUsername(),u.getPassword(),u.isEnabled(),true,true,true,u.getRoles().stream().map(r->new SimpleGrantedAuthority("ROLE_"+r.getName().name())).collect(Collectors.toSet())); }
}
