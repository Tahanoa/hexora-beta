package dev.hexora.security;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="revoked_tokens",indexes=@Index(name="revoked_expiry_idx",columnList="expires_at"))
public class RevokedToken {
 @Id @Column(length=36) public String id;
 @Column(name="expires_at",nullable=false) public Instant expiresAt;
}
