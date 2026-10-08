package dev.hexora.payment;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="payments", indexes={@Index(name="payments_created_idx",columnList="created_at"),@Index(name="payments_paid_idx",columnList="paid_at")})
public class Payment {
 @Id public String id=java.util.UUID.randomUUID().toString();
 @Column(nullable=false,length=50) public String buyer;
 @Column(nullable=false,length=250) public String description;
 @Column(nullable=false) public long amount;
 @Column(nullable=false,length=20) public String status="CREATED";
 @Column(unique=true,length=64) public String authority;
 @Column(length=512) public String merchantEncrypted;
 @Column(length=50) public String refId;
 @Column(length=30) public String cardPan;
 public long fee;
 public Integer gatewayCode;
 @Column(length=100) public String error;
 @Column(name="created_at",nullable=false) public Instant createdAt=Instant.now();
 @Column(name="paid_at") public Instant paidAt;
 @Version public long version;
}
