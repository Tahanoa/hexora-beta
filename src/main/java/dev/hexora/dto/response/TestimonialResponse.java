package dev.hexora.dto.response;
import java.time.LocalDateTime;
public record TestimonialResponse(Long id,String authorName,String role,String company,String projectTitle,String quote,String avatar,String sourceUrl,Integer rating,Integer order,boolean published,LocalDateTime createdAt,LocalDateTime updatedAt) {}
