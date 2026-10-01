package dev.hexora.model;
import dev.hexora.enums.MediaType; import jakarta.persistence.*; import org.hibernate.annotations.JdbcTypeCode; import org.hibernate.type.SqlTypes;
@Entity @Table(name="media")
public class Media extends BaseEntity {
 @Column(nullable=false,length=255) private String fileName;
 @JdbcTypeCode(SqlTypes.VARBINARY) @Column(nullable=false,columnDefinition="bytea") private byte[] data;
 @Column(nullable=false,length=100) private String contentType;
 @Column(nullable=false) private long size;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) private MediaType type;
 public String getFileName(){return fileName;} public void setFileName(String v){fileName=v;}
 public byte[] getData(){return data;} public void setData(byte[] v){data=v;}
 public String getContentType(){return contentType;} public void setContentType(String v){contentType=v;}
 public long getSize(){return size;} public void setSize(long v){size=v;}
 public MediaType getType(){return type;} public void setType(MediaType v){type=v;}
}
