package dev.hexora.repository;
import dev.hexora.model.DemoAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface DemoAssetRepository extends JpaRepository<DemoAsset,Long>{
 Optional<DemoAsset> findByVersionIdAndPath(Long versionId,String path);
 void deleteByVersionId(Long versionId);
}
