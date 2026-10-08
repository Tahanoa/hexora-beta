package dev.hexora.product;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.*;
import java.util.Optional;
public interface ProductReviewRepository extends JpaRepository<ProductReview,Long> {
 Page<ProductReview> findByProductIdAndHiddenFalseOrderByCreatedAtDescIdDesc(Long productId,Pageable page);
 Optional<ProductReview> findByProductIdAndUserId(Long productId,Long userId);
 long countByProductIdAndHiddenFalse(Long productId);
 @Query("select avg(r.rating) from ProductReview r where r.productId=:id and r.hidden=false") Double average(@Param("id") Long id);
}
