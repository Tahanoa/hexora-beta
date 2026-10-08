package dev.hexora.product;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="products")
public class Product {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false,unique=true,length=80) public String slug;
 @Column(nullable=false,length=150) public String title;
 @Column(length=150) public String titleEn;
 @Column(columnDefinition="text") public String description;
 @Column(columnDefinition="text") public String descriptionEn;
 @Column(columnDefinition="text") public String features;
 @Column(columnDefinition="text") public String featuresEn;
 @Column(length=80) public String category;
 @Column(columnDefinition="text") public String requirements;
 @Column(length=500) public String demoUrl;
 public Long coverId;
 @Column(nullable=false) public long price;
 @Column(nullable=false) public boolean published=false;
 @Column(nullable=false) public Instant createdAt=Instant.now();
 @Column(nullable=false,columnDefinition="boolean default false") public boolean deleted=false;
 @Version public long rowVersion;
}
