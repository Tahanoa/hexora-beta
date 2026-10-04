package dev.hexora.model;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
@Entity
@Table(name="demo_versions",uniqueConstraints=@UniqueConstraint(columnNames={"demo_id","number"}))
public class DemoVersion extends BaseEntity {
 @Column(nullable=false)
 private Long demoId;
 @Column(nullable=false)
 private long number;
 @Column(length=200)
 private String label;
 @Column(length=150)
 private String uploadName;
 @Column(nullable=false,length=500)
 private String entryPoint;
 @Column(nullable=false)
 private int fileCount;
 @Column(nullable=false)
 private long totalBytes;
 @Column(length=64)
 private String previewHash;
 
 private java.time.Instant previewExpiresAt;
 public Long getDemoId(){return demoId;}
 public void setDemoId(Long value){demoId=value;}
 public long getNumber(){return number;}
 public void setNumber(long value){number=value;}
 public String getLabel(){return label;}
 public void setLabel(String value){label=value;}
 public String getUploadName(){return uploadName;}
 public void setUploadName(String value){uploadName=value;}
 public String getEntryPoint(){return entryPoint;}
 public void setEntryPoint(String value){entryPoint=value;}
 public int getFileCount(){return fileCount;}
 public void setFileCount(int value){fileCount=value;}
 public long getTotalBytes(){return totalBytes;}
 public void setTotalBytes(long value){totalBytes=value;}
 public String getPreviewHash(){return previewHash;}
 public void setPreviewHash(String value){previewHash=value;}
 public java.time.Instant getPreviewExpiresAt(){return previewExpiresAt;}
 public void setPreviewExpiresAt(java.time.Instant value){previewExpiresAt=value;}
}
