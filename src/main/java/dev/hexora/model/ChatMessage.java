package dev.hexora.model;
import jakarta.persistence.*;
@Entity @Table(name="chat_messages",indexes={@Index(name="chat_user_message",columnList="user_id,id")})
public class ChatMessage extends BaseEntity{
 @Column(name="user_id",nullable=false) private Long userId;
 @Column(nullable=false,columnDefinition="TEXT") private String text;
 @Column(nullable=false) private boolean fromAdmin;
 @Column(nullable=false) private boolean readByRecipient;
 @Column(name="file_data",columnDefinition="bytea") private byte[] fileData;
 public byte[] getFileData(){return fileData;}public void setFileData(byte[] value){fileData=value;}
 @Column(length=150) private String fileName;
 public Long getUserId(){return userId;}public void setUserId(Long v){userId=v;}
 public String getText(){return text;}public void setText(String v){text=v;}
 public boolean isFromAdmin(){return fromAdmin;}public void setFromAdmin(boolean v){fromAdmin=v;}
 public boolean isReadByRecipient(){return readByRecipient;}public void setReadByRecipient(boolean v){readByRecipient=v;}
 public String getFileName(){return fileName;}public void setFileName(String v){fileName=v;}
}
