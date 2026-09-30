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
 public ProfileService(ProfileRepository repository) { super(repository,Profile::new); }
 @Override protected void apply(ProfileRequest request,Profile entity) {
  entity.setFullName(request.getFullName());
  entity.setBrandName(request.getBrandName());
  entity.setTitle(request.getTitle());
  entity.setShortDescription(request.getShortDescription());
  entity.setBio(request.getBio());
  entity.setAboutText(request.getAboutText());
  entity.setJourneyText(request.getJourneyText());
  entity.setProfileImage(request.getProfileImage());
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
}
