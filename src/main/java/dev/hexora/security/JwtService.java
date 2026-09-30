package dev.hexora.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
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
    public JwtService(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.access-token-ttl:900}") long ttlSeconds) {
        if (secret == null || secret.isBlank()) throw new IllegalStateException("JWT_SECRET must be configured");
        byte[] bytes; try { bytes = Decoders.BASE64.decode(secret); } catch (RuntimeException ignored) { bytes = secret.getBytes(StandardCharsets.UTF_8); }
        if (bytes.length < 32) throw new IllegalStateException("JWT_SECRET must contain at least 256 bits");
        key = Keys.hmacShaKeyFor(bytes); this.ttlSeconds = Math.max(60, ttlSeconds);
    }
    public String create(UserDetails user) { Instant now=Instant.now(); return Jwts.builder().subject(user.getUsername()).id(UUID.randomUUID().toString()).claim("roles", user.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList()).issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(ttlSeconds))).signWith(key).compact(); }
    public String username(String token) { return claims(token).getSubject(); }
    public boolean valid(String token, UserDetails user) { try { Claims c=claims(token); return c.getSubject().equals(user.getUsername()) && c.getExpiration().after(new Date()); } catch (RuntimeException e) { return false; } }
    private Claims claims(String token) { return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload(); }
}
