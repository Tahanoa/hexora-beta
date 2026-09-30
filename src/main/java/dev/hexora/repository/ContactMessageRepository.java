package dev.hexora.repository;
import dev.hexora.model.ContactMessage;
import dev.hexora.enums.*;
import java.util.*;
import java.time.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long>, JpaSpecificationExecutor<ContactMessage> {
 long countByIsReadFalse();
 List<ContactMessage> findByIsReadFalseOrderByCreatedAtDesc();
 List<ContactMessage> findByEmailOrderByCreatedAtDesc(String email);
 long deleteByCreatedAtBefore(LocalDateTime cutoff);
}
