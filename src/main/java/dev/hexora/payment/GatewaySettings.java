package dev.hexora.payment;
import jakarta.persistence.*;
@Entity @Table(name="payment_gateway_settings")
public class GatewaySettings {
 @Id public Long id=1L;
 public boolean enabled=false;
 @Column(length=512) public String merchantEncrypted;
 @Column(length=500) public String callbackUrl;
 @Version public long version;
}
