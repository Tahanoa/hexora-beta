package dev.hexora.repository;
import dev.hexora.model.DemoVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface DemoVersionRepository extends JpaRepository<DemoVersion,Long>{
 List<DemoVersion> findByDemoIdOrderByNumberDesc(Long demoId);
 long countByDemoId(Long demoId);
}
