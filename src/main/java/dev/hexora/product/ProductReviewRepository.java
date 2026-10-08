package dev.hexora.product;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.*;
import java.util.Optional;
public interface ProductReviewRepository extends JpaRepository<ProductReview,Long> {
 Page<ProductReview> findByProductIdOrderByCreatedAtDescIdDesc(Long productId,Pageable page);
 Optional<ProductReview> findByProductIdAndUserId(Long productId,Long userId);
 long countByProductId(Long productId);
 @Query("select avg(r.rating) from ProductReview r where r.productId=:id") Double average(@Param("id") Long id);
}
