package dev.hexora.product;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="product_reviews",uniqueConstraints=@UniqueConstraint(columnNames={"product_id","user_id"}),indexes=@Index(columnList="product_id,created_at"))
public class ProductReview {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(name="product_id",nullable=false) public Long productId;
 @Column(name="user_id",nullable=false) public Long userId;
 @Column(nullable=false) public int rating;
 @Column(nullable=false,length=3000) public String text;
 @Column(name="created_at",nullable=false) public Instant createdAt=Instant.now();
 @Column(nullable=false) public Instant updatedAt=Instant.now();
 @Version public long rowVersion;
}
