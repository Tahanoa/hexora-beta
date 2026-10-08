package dev.hexora.product;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.*;
import jakarta.persistence.LockModeType;
import java.util.*;
public interface ProductRepository extends JpaRepository<Product,Long> {
 Optional<Product> findBySlugAndPublishedTrue(String slug);
 Page<Product> findByPublishedTrue(Pageable page);
 long countByPublishedTrue();
 @Query("select p from Product p where (:published is null or p.published=:published) and (:q='' or locate(:q,lower(p.title))>0 or locate(:q,lower(p.slug))>0 or locate(:q,lower(coalesce(p.category,'')))>0)")
 Page<Product> search(@Param("q") String q,@Param("published") Boolean published,Pageable page);
 boolean existsBySlug(String slug);
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select p from Product p where p.id=:id") Optional<Product> locked(@Param("id") Long id);
 @Query("select p from Product p where p.id in (select t.productId from Payment t where t.purchaserId=:user and t.status='PAID')") Page<Product> owned(@Param("user") Long user,Pageable page);
}
