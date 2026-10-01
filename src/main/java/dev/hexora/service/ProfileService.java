package dev.hexora.service;
import dev.hexora.model.Profile;
import dev.hexora.dto.request.ProfileRequest;
import dev.hexora.dto.response.ProfileResponse;
import dev.hexora.repository.ProfileRepository;
import dev.hexora.enums.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@Transactional
public class ProfileService extends CrudService<Profile,ProfileRequest,ProfileResponse> {
 private final dev.hexora.repository.MediaRepository media;
 public ProfileService(ProfileRepository repository,dev.hexora.repository.MediaRepository media) { super(repository,Profile::new);this.media=media; }
 @Override protected void apply(ProfileRequest request,Profile entity) {
  entity.setFullName(request.getFullName());
  entity.setBrandName(request.getBrandName());
  entity.setTitle(request.getTitle());
  entity.setShortDescription(request.getShortDescription());
  entity.setBio(request.getBio());
  entity.setAboutText(request.getAboutText());
  entity.setJourneyText(request.getJourneyText());
  entity.setProfileImage(request.getProfileImage());
  if(request.getAvatarId()!=null){
   var avatar=media.findById(request.getAvatarId()).orElseThrow(dev.hexora.api.ApiException::notFound);
   if(avatar.getType()!=MediaType.IMAGE) throw new IllegalArgumentException("Avatar must be an image");
  }
  entity.setAvatarId(request.getAvatarId());
  entity.setEmail(request.getEmail());
  entity.setPhone(request.getPhone());
  entity.setLocation(request.getLocation());
  entity.setGithubUrl(request.getGithubUrl());
  entity.setLinkedinUrl(request.getLinkedinUrl());
  entity.setInstagramUrl(request.getInstagramUrl());
  entity.setWorkingStatus(request.getWorkingStatus()==null ? WorkingStatus.AVAILABLE : WorkingStatus.fromString(request.getWorkingStatus()));
 }
 @Override public ProfileResponse view(Profile entity) {
  ProfileResponse response=new ProfileResponse();
  response.setId(entity.getId());
  response.setFullName(entity.getFullName());
  response.setBrandName(entity.getBrandName());
  response.setTitle(entity.getTitle());
  response.setShortDescription(entity.getShortDescription());
  response.setBio(entity.getBio());
  response.setAboutText(entity.getAboutText());
  response.setJourneyText(entity.getJourneyText());
  response.setProfileImage(entity.getProfileImage());
  response.setAvatarId(entity.getAvatarId());
  response.setAvatarUrl(entity.getAvatarId()==null ? null : "/api/media/public/"+entity.getAvatarId());
  response.setEmail(entity.getEmail());
  response.setPhone(entity.getPhone());
  response.setLocation(entity.getLocation());
  response.setGithubUrl(entity.getGithubUrl());
  response.setLinkedinUrl(entity.getLinkedinUrl());
  response.setInstagramUrl(entity.getInstagramUrl());
  response.setWorkingStatus(entity.getWorkingStatus()==null ? null : entity.getWorkingStatus().name());
  response.setCreatedAt(entity.getCreatedAt());
  response.setUpdatedAt(entity.getUpdatedAt());
  return response;
 }
 public Profile latest() {return ((ProfileRepository)repository).findFirstByOrderByCreatedAtDescIdDesc().orElseThrow(dev.hexora.api.ApiException::notFound);}
 public ProfileResponse basic(dev.hexora.dto.request.ProfileBasicUpdateRequest request) {
  Profile entity=((ProfileRepository)repository).findFirstByOrderByCreatedAtDescIdDesc().orElseGet(Profile::new);
  entity.setFullName(request.getFullName());entity.setBrandName(request.getBrandName());entity.setBio(request.getBio());entity.setLocation(request.getLocation());
  return view(repository.saveAndFlush(entity));
 }
 public ProfileResponse status(Long id,String status){Profile entity=required(id);entity.setWorkingStatus(WorkingStatus.fromString(status));return view(repository.saveAndFlush(entity));}
 public ProfileResponse avatar(Long id){Profile entity=latest();entity.setAvatarId(id);return view(repository.saveAndFlush(entity));}
}
