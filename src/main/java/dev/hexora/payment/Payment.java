package dev.hexora.payment;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="payments", indexes={@Index(name="payments_created_idx",columnList="created_at"),@Index(name="payments_paid_idx",columnList="paid_at"),@Index(name="payment_product_owner_idx",columnList="product_id,purchaser_id,status")})
public class Payment {
 @Id public String id=java.util.UUID.randomUUID().toString();
 // Retained for existing database compatibility; direct invoices do not require a user.
 @Column(nullable=false,length=50) public String buyer="DIRECT_LINK";
 @Column(nullable=false,length=250) public String description;
 @Column(nullable=false) public long amount;
 @Column(nullable=false,length=20) public String status="CREATED";
 @Column(unique=true,length=64) public String authority;
 @Column(length=512) public String merchantEncrypted;
 @Column(length=50) public String refId;
 @Column(length=30) public String cardPan;
 @Column(name="product_id") public Long productId;
 @Column(name="purchaser_id") public Long purchaserId;
 public Instant termsAcceptedAt;
 @Column(length=32) public String termsVersion;
 public long fee;
 public Instant lastRequestAt;
 public Instant lastVerifyAt;
 public Integer gatewayCode;
 @Column(length=100) public String error;
 @Column(name="created_at",nullable=false) public Instant createdAt=Instant.now();
 @Column(name="paid_at") public Instant paidAt;
 public boolean isShareable(){return productId==null&&purchaserId==null;}
 public String invoiceType(){return isShareable()?"DIRECT_LINK":"PRODUCT_PRIVATE";}
 @Version public long version;
}
