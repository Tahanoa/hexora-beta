package dev.hexora.dto.response;
import java.time.LocalDateTime;
public record ChatMessageResponse(Long id,String text,boolean fromAdmin,String fileName,LocalDateTime createdAt){}
