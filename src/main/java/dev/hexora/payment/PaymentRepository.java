package dev.hexora.payment;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.*;
import jakarta.persistence.LockModeType;
import java.util.*;
import java.time.Instant;
public interface PaymentRepository extends JpaRepository<Payment,String> {
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select p from Payment p where p.id=:id") Optional<Payment> locked(@Param("id") String id);
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select p from Payment p where p.authority=:authority") Optional<Payment> lockedByAuthority(@Param("authority") String authority);
 Page<Payment> findByBuyer(String buyer,Pageable page);
 Page<Payment> findByStatus(String status,Pageable page);
 @Query("select p.status,count(p) from Payment p where p.createdAt>=:from and p.createdAt<:to group by p.status") List<Object[]> statuses(@Param("from") Instant from,@Param("to") Instant to);
 @Query("select coalesce(sum(p.amount),0),coalesce(sum(p.fee),0),count(p) from Payment p where p.status='PAID' and p.paidAt>=:from and p.paidAt<:to") List<Object[]> totals(@Param("from") Instant from,@Param("to") Instant to);
 @Query(value="select to_char(paid_at AT TIME ZONE 'Asia/Tehran','YYYY-MM-DD'),sum(amount),count(*) from payments where status='PAID' and paid_at>=:from and paid_at<:to group by 1 order by 1",nativeQuery=true) List<Object[]> daily(@Param("from") Instant from,@Param("to") Instant to);
}
