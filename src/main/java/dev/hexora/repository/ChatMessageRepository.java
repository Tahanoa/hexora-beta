package dev.hexora.repository;
import dev.hexora.model.ChatMessage;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface ChatMessageRepository extends JpaRepository<ChatMessage,Long>{
 List<ChatMessage> findByUserIdOrderByIdDesc(Long userId,Pageable page);
 List<ChatMessage> findByUserIdAndIdGreaterThanOrderByIdAsc(Long userId,Long after,Pageable page);
 List<ChatMessage> findByUserIdAndIdLessThanOrderByIdDesc(Long userId,Long before,Pageable page);
 Optional<ChatMessage> findTopByUserIdOrderByIdDesc(Long userId);
 long countByUserIdAndFromAdminAndReadByRecipientFalse(Long userId,boolean fromAdmin);
 long countByFromAdminFalseAndReadByRecipientFalse();
 @Query("select distinct m.userId from ChatMessage m") List<Long> conversationUsers();
 @Modifying @Query("update ChatMessage m set m.readByRecipient=true where m.userId=:userId and m.fromAdmin=:fromAdmin and m.id in :ids")
 void markRead(@Param("userId")Long userId,@Param("fromAdmin")boolean fromAdmin,@Param("ids")List<Long> ids);
}
