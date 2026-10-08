package dev.hexora.product;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="product_releases",uniqueConstraints=@UniqueConstraint(columnNames={"product_id","version_label"}))
public class ProductRelease {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(name="product_id",nullable=false) public Long productId;
 @Column(name="version_label",nullable=false,length=50) public String version;
 @Column(columnDefinition="text") public String changelog;
 @Column(nullable=false) public boolean published=false;
 @Column(nullable=false,length=64) public String sha256;
 @Column(nullable=false) public long size;
 @Column(nullable=false) public Instant createdAt=Instant.now();
 @Version public long rowVersion;
}
