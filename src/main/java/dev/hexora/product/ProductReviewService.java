package dev.hexora.product;
import dev.hexora.api.ApiException;
import dev.hexora.repository.UserRepository;
import dev.hexora.payment.PaymentRepository;
import jakarta.validation.constraints.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.PageRequest;
import java.time.Instant;
import java.util.*;
@Service
public class ProductReviewService {
 private final ProductReviewRepository reviews;private final ProductRepository products;private final UserRepository users;private final PaymentRepository payments;
 public ProductReviewService(ProductReviewRepository r,ProductRepository p,UserRepository u,PaymentRepository pay){reviews=r;products=p;users=u;payments=pay;}
 public record Request(@Min(1) @Max(5) int rating,@NotBlank @Size(max=3000) String text) {}
 private Product product(Long id){return products.findById(id).filter(p->p.published).orElseThrow(ApiException::notFound);}
 private Object view(ProductReview r){return Map.of("id",r.id,"rating",r.rating,"text",r.text,"createdAt",r.createdAt,"updatedAt",r.updatedAt);}
 @Transactional(readOnly=true) public Object list(String slug,int page){var p=products.findBySlugAndPublishedTrue(slug).orElseThrow(ApiException::notFound);var avg=reviews.average(p.id);return Map.of("reviews",reviews.findByProductIdOrderByCreatedAtDescIdDesc(p.id,PageRequest.of(Math.max(0,page),10)).map(this::view),"count",reviews.countByProductId(p.id),"average",avg==null?0:avg);}
 public Object mine(Long id,String username){product(id);var u=users.findByUsernameIgnoreCase(username).orElseThrow(ApiException::notFound);var out=new LinkedHashMap<String,Object>();out.put("eligible",payments.existsByProductIdAndPurchaserIdAndStatus(id,u.getId(),"PAID"));out.put("review",reviews.findByProductIdAndUserId(id,u.getId()).map(this::view).orElse(null));return out;}
 @Transactional public Object save(Long id,String username,Request input){product(id);var u=users.lockedByUsername(username).orElseThrow(ApiException::notFound);if(!payments.existsByProductIdAndPurchaserIdAndStatus(id,u.getId(),"PAID"))throw new ApiException(HttpStatus.FORBIDDEN,"A verified purchase is required to review this product");var r=reviews.findByProductIdAndUserId(id,u.getId()).orElseGet(ProductReview::new);if(r.id!=null&&r.updatedAt.isAfter(Instant.now().minusSeconds(30)))throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,"Please wait 30 seconds before editing your review");r.productId=id;r.userId=u.getId();r.rating=input.rating();r.text=input.text().trim();r.updatedAt=Instant.now();return view(reviews.saveAndFlush(r));}
 public Object adminList(Long id,int page){if(!products.existsById(id))throw ApiException.notFound();return reviews.findByProductIdOrderByCreatedAtDescIdDesc(id,PageRequest.of(Math.max(0,page),10)).map(this::view);}
 @Transactional public void adminDelete(Long id,Long reviewId){var r=reviews.findById(reviewId).filter(x->x.productId.equals(id)).orElseThrow(ApiException::notFound);reviews.delete(r);}
 @Transactional public void delete(Long id,String username){var u=users.lockedByUsername(username).orElseThrow(ApiException::notFound);reviews.findByProductIdAndUserId(id,u.getId()).ifPresent(reviews::delete);}
}
