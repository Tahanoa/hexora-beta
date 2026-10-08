package dev.hexora.product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface ProductReleaseRepository extends JpaRepository<ProductRelease,Long> {
 List<ProductRelease> findByProductIdOrderByCreatedAtDesc(Long productId);
 List<ProductRelease> findByProductIdAndPublishedTrueOrderByCreatedAtDesc(Long productId);
 boolean existsByProductIdAndVersion(Long productId,String version);
 boolean existsByProductIdAndPublishedTrue(Long productId);
}
