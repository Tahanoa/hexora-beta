package dev.hexora.service;
import dev.hexora.api.ApiException;
import dev.hexora.enums.MediaType;
import dev.hexora.model.Media;
import dev.hexora.repository.MediaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.io.IOException;
@Service @Transactional
public class MediaService {
 private final MediaRepository repository;
 public MediaService(MediaRepository repository){this.repository=repository;}
 public Media upload(MultipartFile file,MediaType type){Media entity=new Media();apply(file,type,entity);return repository.saveAndFlush(entity);}
 public Media update(Long id,MultipartFile file){Media entity=repository.findById(id).orElseThrow(ApiException::notFound);apply(file,entity.getType(),entity);return repository.saveAndFlush(entity);}
 private void apply(MultipartFile file,MediaType type,Media entity){
  if(file.isEmpty()||file.getSize()>5*1024*1024)throw new IllegalArgumentException("Invalid file size");
  byte[] bytes;try{bytes=file.getBytes();}catch(IOException ex){throw new IllegalStateException("Cannot read upload",ex);}
  String mime=detect(bytes);
  if(type==MediaType.IMAGE&&!mime.startsWith("image/"))throw new IllegalArgumentException("Only PNG, JPEG, GIF or WebP images are allowed");
  if(type!=MediaType.IMAGE&&!(mime.equals("application/pdf")||mime.startsWith("image/")))throw new IllegalArgumentException("Only images and PDF documents are allowed");
  String name=Optional.ofNullable(file.getOriginalFilename()).orElse("upload").replaceAll("[\\r\\n\\/\\\\]","_");
  if(name.length()>255)name=name.substring(name.length()-255);
  entity.setFileName(name);entity.setContentType(mime);entity.setData(bytes);entity.setSize(bytes.length);entity.setType(type);
 }
 private String detect(byte[] b){
  if(b.length>=8&&Arrays.equals(Arrays.copyOf(b,8),new byte[]{(byte)137,80,78,71,13,10,26,10}))return "image/png";
  if(b.length>=3&&(b[0]&255)==255&&(b[1]&255)==216&&(b[2]&255)==255)return "image/jpeg";
  if(b.length>=6&&new String(b,0,6,StandardCharsets.US_ASCII).matches("GIF8[79]a"))return "image/gif";
  if(b.length>=12&&new String(b,0,4,StandardCharsets.US_ASCII).equals("RIFF")&&new String(b,8,4,StandardCharsets.US_ASCII).equals("WEBP"))return "image/webp";
  if(b.length>=5&&new String(b,0,5,StandardCharsets.US_ASCII).equals("%PDF-"))return "application/pdf";
  throw new IllegalArgumentException("Unsupported file content");
 }
 public Map<String,Object> info(Media media){return Map.of("id",media.getId(),"fileName",media.getFileName(),"size",media.getSize(),"type",media.getType().name(),"url","/api/media/public/"+media.getId(),"contentType",media.getContentType(),"createdAt",media.getCreatedAt());}
}
