package dev.hexora.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {
    private final SecretKey key; private final long ttlSeconds;
    private final dev.hexora.repository.UserRepository users;private final org.springframework.jdbc.core.JdbcTemplate jdbc;
    public JwtService(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.access-token-ttl:900}") long ttlSeconds,dev.hexora.repository.UserRepository users,org.springframework.jdbc.core.JdbcTemplate jdbc) {
        this.users=users;this.jdbc=jdbc;
        if (secret == null || secret.isBlank()) throw new IllegalStateException("JWT_SECRET must be configured");
        byte[] bytes; try { bytes = Decoders.BASE64.decode(secret); } catch (RuntimeException ignored) { bytes = secret.getBytes(StandardCharsets.UTF_8); }
        if (bytes.length < 32) throw new IllegalStateException("JWT_SECRET must contain at least 256 bits");
        key = Keys.hmacShaKeyFor(bytes); this.ttlSeconds = Math.max(60, ttlSeconds);
    }
    public String create(dev.hexora.model.User user) { Instant now=Instant.now(); return Jwts.builder().subject(user.getUsername()).id(UUID.randomUUID().toString()).claim("tokenVersion",user.getTokenVersion()).claim("roles",user.getRoles().stream().map(r->"ROLE_"+r.getName().name()).toList()).issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(ttlSeconds))).signWith(key).compact(); }
    public String username(String token) { return claims(token).getSubject(); }
    public long ttlSeconds(){return ttlSeconds;}
    public boolean valid(String token, UserDetails user) {
        try {
            Claims c=claims(token);Number version=c.get("tokenVersion",Number.class);
            if(!user.isEnabled()||!user.isAccountNonExpired()||!user.isAccountNonLocked()||!user.isCredentialsNonExpired()||version==null||c.getId()==null||!c.getId().matches("[a-f0-9-]{36}")||!c.getSubject().equals(user.getUsername()))return false;
            var account=users.findByUsernameIgnoreCase(user.getUsername()).orElseThrow();
            return account.isEnabled()&&account.getTokenVersion()==version.longValue()&&!Boolean.TRUE.equals(jdbc.queryForObject("select exists(select 1 from revoked_tokens where id=?)",Boolean.class,c.getId()));
        } catch (RuntimeException e) { return false; }
    }
    public void revoke(String token){Claims c=claims(token);jdbc.update("insert into revoked_tokens(id,expires_at) values (?,?) on conflict(id) do nothing",c.getId(),java.sql.Timestamp.from(c.getExpiration().toInstant()));}
    private Claims claims(String token) { return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload(); }
}
