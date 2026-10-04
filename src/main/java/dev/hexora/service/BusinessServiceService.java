package dev.hexora.service;
import dev.hexora.model.BusinessService;
import dev.hexora.dto.request.ServiceRequest;
import dev.hexora.dto.response.ServiceResponse;
import dev.hexora.repository.BusinessServiceRepository;
import dev.hexora.enums.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@Transactional
public class BusinessServiceService extends CrudService<BusinessService,ServiceRequest,ServiceResponse> {
 private final dev.hexora.repository.ProjectRepository projects;
 private final dev.hexora.repository.MediaRepository media;
 public BusinessServiceService(BusinessServiceRepository repository,dev.hexora.repository.ProjectRepository projects,dev.hexora.repository.MediaRepository media) { super(repository,BusinessService::new);this.projects=projects;this.media=media; }
 @Override protected void apply(ServiceRequest request,BusinessService entity) {
  String slug=request.getSlug();
  if(slug==null||slug.isBlank())slug=entity.getSlug()!=null?entity.getSlug():"service-"+java.util.UUID.randomUUID();
  final String selectedSlug=slug;
  ((BusinessServiceRepository)repository).findBySlug(selectedSlug).ifPresent(existing->{if(!java.util.Objects.equals(existing.getId(),entity.getId()))throw new dev.hexora.api.ApiException(org.springframework.http.HttpStatus.CONFLICT,"Service slug already exists");});
  if(request.getCover()!=null&&!request.getCover().startsWith("/api/media/public/")&&!new dev.hexora.validation.UrlValidator().isValid(request.getCover(),null))throw new IllegalArgumentException("Invalid cover URL");
  entity.setSlug(slug);
  if(Boolean.TRUE.equals(request.getPublished()) && (request.getShortDescription()==null||request.getShortDescription().isBlank()||request.getDeliverables()==null||request.getDeliverables().isEmpty()))throw new IllegalArgumentException("Published services need a short introduction and deliverables");
  if(request.getRelatedProjectIds()!=null && projects.countByIdIn(request.getRelatedProjectIds().stream().distinct().toList())!=request.getRelatedProjectIds().stream().distinct().count())throw new IllegalArgumentException("A related project does not exist");
  if(request.getCover()!=null && request.getCover().startsWith("/api/media/public/")){var image=media.findById(Long.parseLong(request.getCover().substring(18))).orElseThrow(dev.hexora.api.ApiException::notFound);if(!image.getContentType().startsWith("image/"))throw new IllegalArgumentException("Cover must be an image");}
  if(java.util.Set.of("FROM","RANGE").contains(request.getPricingMode()==null?"QUOTE":request.getPricingMode()) && (request.getPriceLabel()==null||request.getPriceLabel().isBlank()))throw new IllegalArgumentException("Enter a price or range");
  entity.setTitle(request.getTitle().trim());
  entity.setDescription(request.getDescription());
  entity.setIcon(request.getIcon());
  entity.setFeatures(request.getFeatures());
  entity.setOrder(request.getOrder());
  entity.setShortDescription(request.getShortDescription());
  entity.setCover(request.getCover());
  entity.setAudience(request.getAudience());
  entity.setScope(request.getScope());
  entity.setExclusions(request.getExclusions());
  entity.setDuration(request.getDuration());
  entity.setPricingMode(request.getPricingMode());
  entity.setPriceLabel(request.getPriceLabel());
  entity.setSupport(request.getSupport());
  entity.setRevisions(request.getRevisions());
  entity.setPublished(Boolean.TRUE.equals(request.getPublished()));
  entity.setFeatured(Boolean.TRUE.equals(request.getFeatured()));
  entity.setDeliverables(new java.util.ArrayList<>(request.getDeliverables()==null?java.util.List.of():request.getDeliverables()));
  entity.setRelatedProjectIds(new java.util.ArrayList<>(request.getRelatedProjectIds()==null?java.util.List.of():request.getRelatedProjectIds()));
  entity.setFaqs(new java.util.ArrayList<>(request.getFaqs()==null?java.util.List.of():request.getFaqs()));
 }
 @Override public ServiceResponse view(BusinessService entity) {
  ServiceResponse response=new ServiceResponse();
  response.setId(entity.getId());
  response.setSlug(entity.getSlug());
  response.setShortDescription(entity.getShortDescription());
  response.setCover(entity.getCover());
  response.setAudience(entity.getAudience());
  response.setScope(entity.getScope());
  response.setExclusions(entity.getExclusions());
  response.setDuration(entity.getDuration());
  response.setPricingMode(entity.getPricingMode());
  response.setPriceLabel(entity.getPriceLabel());
  response.setSupport(entity.getSupport());
  response.setRevisions(entity.getRevisions());
  response.setFeatured(entity.getFeatured());
  response.setDeliverables(new java.util.ArrayList<>(entity.getDeliverables()));
  response.setRelatedProjectIds(new java.util.ArrayList<>(entity.getRelatedProjectIds()));
  response.setFaqs(new java.util.ArrayList<>(entity.getFaqs()));
  response.setPublished(isPublished(entity));
  response.setTitle(entity.getTitle());
  response.setDescription(entity.getDescription());
  response.setIcon(entity.getIcon());
  response.setFeatures(entity.getFeatures());
  response.setOrder(entity.getOrder());
  response.setCreatedAt(entity.getCreatedAt());
  response.setUpdatedAt(entity.getUpdatedAt());
  return response;
 }
 public static boolean isPublished(BusinessService entity){return !Boolean.FALSE.equals(entity.getPublished());}
 @Transactional(readOnly=true) public java.util.List<ServiceResponse> published(){return repository.findAll(org.springframework.data.domain.Sort.by("order","id")).stream().filter(BusinessServiceService::isPublished).map(this::view).toList();}
 @Transactional(readOnly=true) public ServiceResponse publicFind(Long id){var entity=required(id);if(!isPublished(entity))throw dev.hexora.api.ApiException.notFound();return view(entity);}
 @Transactional(readOnly=true) public ServiceResponse publicSlug(String slug){var entity=((BusinessServiceRepository)repository).findBySlug(slug).orElseThrow(dev.hexora.api.ApiException::notFound);if(!isPublished(entity))throw dev.hexora.api.ApiException.notFound();return view(entity);}
}
