package dev.hexora.product;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="product_downloads",indexes=@Index(name="product_download_user_time",columnList="user_id,created_at"))
public class DownloadAudit {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(name="user_id",nullable=false) public Long userId;
 @Column(nullable=false) public Long productId;
 @Column(nullable=false) public Long releaseId;
 @Column(name="created_at",nullable=false) public Instant createdAt=Instant.now();
}
