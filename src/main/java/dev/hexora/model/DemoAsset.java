package dev.hexora.model;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
@Entity
@Table(name="demo_assets",uniqueConstraints=@UniqueConstraint(columnNames={"version_id","path"}))
public class DemoAsset extends BaseEntity {
 @Column(nullable=false)
 private Long versionId;
 @Column(nullable=false,length=500)
 private String path;
 @Column(nullable=false,length=100)
 private String contentType;
 @JdbcTypeCode(SqlTypes.VARBINARY) @Column(nullable=false,columnDefinition="bytea")
 private byte[] data;
 public Long getVersionId(){return versionId;}
 public void setVersionId(Long value){versionId=value;}
 public String getPath(){return path;}
 public void setPath(String value){path=value;}
 public String getContentType(){return contentType;}
 public void setContentType(String value){contentType=value;}
 public byte[] getData(){return data;}
 public void setData(byte[] value){data=value;}
}
