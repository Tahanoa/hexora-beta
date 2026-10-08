package dev.hexora.product;
import org.springframework.data.jpa.repository.*;
import java.util.*;
public interface ProductReleaseRepository extends JpaRepository<ProductRelease,Long> {
 @Query("select count(r) from ProductRelease r where r.productId in (select p.id from Product p where p.deleted=false)") long countActive();
 List<ProductRelease> findByProductIdOrderByCreatedAtDesc(Long productId);
 List<ProductRelease> findByProductIdAndPublishedTrueOrderByCreatedAtDesc(Long productId);
 boolean existsByProductIdAndVersion(Long productId,String version);
 boolean existsByProductIdAndPublishedTrue(Long productId);
}
