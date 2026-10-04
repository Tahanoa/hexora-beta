package dev.hexora.model;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
@Entity
@Table(name="demo_sites")
public class DemoSite extends BaseEntity {
 @Column(nullable=false,length=100)
 private String title;
 @Column(nullable=false,unique=true,length=80)
 private String slug;
 @Column(unique=true)
 private Long projectId;
 
 private Long publishedVersionId;
 @Column(nullable=false)
 private long nextVersion;
 public String getTitle(){return title;}
 public void setTitle(String value){title=value;}
 public String getSlug(){return slug;}
 public void setSlug(String value){slug=value;}
 public Long getProjectId(){return projectId;}
 public void setProjectId(Long value){projectId=value;}
 public Long getPublishedVersionId(){return publishedVersionId;}
 public void setPublishedVersionId(Long value){publishedVersionId=value;}
 public long getNextVersion(){return nextVersion;}
 public void setNextVersion(long value){nextVersion=value;}
}
