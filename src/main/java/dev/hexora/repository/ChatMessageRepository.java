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
 long deleteByUserIdAndFromAdminFalse(Long userId);
 long countByUserIdAndFromAdminAndReadByRecipientFalse(Long userId,boolean fromAdmin);
 long countByFromAdminFalseAndReadByRecipientFalse();
 long countByUserIdAndFromAdminFalse(Long userId);
 @Query(value="select coalesce(sum(octet_length(convert_to(text,'UTF8'))+coalesce(octet_length(file_data),0)),0) from chat_messages where user_id=:user and from_admin=false",nativeQuery=true)
 long incomingBytes(@Param("user") Long userId);
 @Query(value="select m.userId from ChatMessage m group by m.userId order by max(m.id) desc",countQuery="select count(distinct m.userId) from ChatMessage m")
 org.springframework.data.domain.Page<Long> conversationUsers(Pageable page);
 String FILTER=" from chat_messages m join users u on u.id=m.user_id where m.id=(select max(x.id) from chat_messages x where x.user_id=m.user_id) and (:state='' or (:state='NEW' and exists(select 1 from chat_messages n where n.user_id=m.user_id and n.from_admin=false and n.read_by_recipient=false)) or (:state='WAITING' and m.from_admin=false) or (:state='HANDLED' and m.from_admin=true and not exists(select 1 from chat_messages n where n.user_id=m.user_id and n.from_admin=false and n.read_by_recipient=false))) and (:q='' or lower(u.username) like concat('%',:q,'%') or lower(m.text) like concat('%',:q,'%'))";
 @Query(value="select m.user_id"+FILTER+" order by m.id desc",countQuery="select count(*)"+FILTER,nativeQuery=true)
 org.springframework.data.domain.Page<Long> conversationUsersFiltered(@Param("state")String state,@Param("q")String q,Pageable page);
 @Modifying @Query("update ChatMessage m set m.readByRecipient=true where m.userId=:userId and m.fromAdmin=:fromAdmin and m.id in :ids")
 void markRead(@Param("userId")Long userId,@Param("fromAdmin")boolean fromAdmin,@Param("ids")List<Long> ids);
}
