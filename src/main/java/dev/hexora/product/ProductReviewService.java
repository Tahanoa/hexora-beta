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
 private Product product(Long id){return products.findById(id).filter(p->p.published&&!p.deleted).orElseThrow(ApiException::notFound);}
 private Object view(ProductReview r){return Map.of("id",r.id,"rating",r.rating,"text",r.text,"createdAt",r.createdAt,"updatedAt",r.updatedAt);}
 @Transactional(readOnly=true) public Object list(String slug,int page){var p=products.findBySlugAndPublishedTrueAndDeletedFalse(slug).orElseThrow(ApiException::notFound);var avg=reviews.average(p.id);return Map.of("reviews",reviews.findByProductIdAndHiddenFalseOrderByCreatedAtDescIdDesc(p.id,PageRequest.of(Math.max(0,page),10)).map(this::view),"count",reviews.countByProductIdAndHiddenFalse(p.id),"average",avg==null?0:avg);}
 public Object mine(Long id,String username){product(id);var u=users.findByUsernameIgnoreCase(username).orElseThrow(ApiException::notFound);var out=new LinkedHashMap<String,Object>();out.put("eligible",payments.existsByProductIdAndPurchaserIdAndStatus(id,u.getId(),"PAID"));out.put("review",reviews.findByProductIdAndUserId(id,u.getId()).map(this::view).orElse(null));return out;}
 @Transactional public Object save(Long id,String username,Request input){product(id);var u=users.lockedByUsername(username).orElseThrow(ApiException::notFound);if(!payments.existsByProductIdAndPurchaserIdAndStatus(id,u.getId(),"PAID"))throw new ApiException(HttpStatus.FORBIDDEN,"A verified purchase is required to review this product");if(reviews.findByProductIdAndUserId(id,u.getId()).isPresent())throw new ApiException(HttpStatus.CONFLICT,"You can submit only one review per product; reviews cannot be edited");var r=new ProductReview();r.productId=id;r.userId=u.getId();r.rating=input.rating();r.text=input.text().trim();r.updatedAt=Instant.now();return view(reviews.saveAndFlush(r));}
 public Object adminList(Long id,int page){if(!products.existsById(id))throw ApiException.notFound();return reviews.findByProductIdAndHiddenFalseOrderByCreatedAtDescIdDesc(id,PageRequest.of(Math.max(0,page),10)).map(this::view);}
 @Transactional public void adminDelete(Long id,Long reviewId){var r=reviews.findById(reviewId).filter(x->x.productId.equals(id)).orElseThrow(ApiException::notFound);r.hidden=true;reviews.save(r);}
}
