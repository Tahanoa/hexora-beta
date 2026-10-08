package dev.hexora.product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
public interface DownloadAuditRepository extends JpaRepository<DownloadAudit,Long> {
 long countByUserIdAndCreatedAtAfter(Long userId,Instant time);
}
