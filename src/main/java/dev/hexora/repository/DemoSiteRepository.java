package dev.hexora.repository;
import dev.hexora.model.DemoSite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import java.util.Optional;
public interface DemoSiteRepository extends JpaRepository<DemoSite,Long>{
 Optional<DemoSite> findBySlug(String slug);
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select d from DemoSite d where d.id = :id") Optional<DemoSite> lockById(@org.springframework.data.repository.query.Param("id") Long id);
}
