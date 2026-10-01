package dev.hexora.service;
import dev.hexora.model.Testimonial;
import dev.hexora.dto.request.TestimonialRequest;
import dev.hexora.dto.response.TestimonialResponse;
import dev.hexora.repository.TestimonialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;
import java.util.List;
@Service @Transactional
public class TestimonialService extends CrudService<Testimonial,TestimonialRequest,TestimonialResponse>{
 public TestimonialService(TestimonialRepository repository){super(repository,Testimonial::new);}
 private String clean(String value){return value==null||value.isBlank()?null:value.trim();}
 @Override protected void apply(TestimonialRequest request,Testimonial entity){
  entity.setAuthorName(clean(request.getAuthorName()));
  entity.setRole(clean(request.getRole()));
  entity.setCompany(clean(request.getCompany()));
  entity.setProjectTitle(clean(request.getProjectTitle()));
  entity.setQuote(clean(request.getQuote()));
  entity.setAvatar(clean(request.getAvatar()));
  entity.setSourceUrl(clean(request.getSourceUrl()));
  entity.setRating(request.getRating());
  entity.setOrder(request.getOrder()==null?0:request.getOrder());
  entity.setPublished(request.getPublished());
 }
 @Override public TestimonialResponse view(Testimonial entity){return new TestimonialResponse(entity.getId(),entity.getAuthorName(),entity.getRole(),entity.getCompany(),entity.getProjectTitle(),entity.getQuote(),entity.getAvatar(),entity.getSourceUrl(),entity.getRating(),entity.getOrder(),entity.getPublished(),entity.getCreatedAt(),entity.getUpdatedAt());}
 public List<TestimonialResponse> published(){return ((TestimonialRepository)repository).findByPublishedTrue(Sort.by("order").ascending().and(Sort.by("id").descending())).stream().map(this::view).toList();}
}
