package dev.hexora.security;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="request_limits",indexes=@Index(name="request_limit_expiry_idx",columnList="reset_at"))
public class RequestLimit {
 @Id @Column(length=64) public String id;
 public int attempts;
 @Column(nullable=false) public Instant resetAt;
 public Instant blockedUntil;
}
