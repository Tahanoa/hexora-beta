package dev.hexora.user;
import dev.hexora.api.ApiException;
import dev.hexora.controller.Queries;
import dev.hexora.enums.RoleType;
import dev.hexora.model.User;
import dev.hexora.repository.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Service
public class UserAdminService {
 private final UserRepository users;private final RoleRepository roles;private final JdbcTemplate jdbc;
 public UserAdminService(UserRepository users,RoleRepository roles,JdbcTemplate jdbc){this.users=users;this.roles=roles;this.jdbc=jdbc;}
 private RoleType primaryRole(User user){for(var role:List.of(RoleType.ADMIN,RoleType.EDITOR,RoleType.VIEWER))if(user.getRoles().stream().anyMatch(r->r.getName()==role))return role;return RoleType.USER;}
 private boolean admin(User user){return user.getRoles().stream().anyMatch(r->r.getName()==RoleType.ADMIN);}
 private Map<String,Object> view(User user){var out=new LinkedHashMap<String,Object>();out.put("id",user.getId());out.put("username",user.getUsername());out.put("email",user.getEmail());out.put("phone",user.getPhone()==null?"":user.getPhone());out.put("enabled",user.isEnabled());out.put("role",primaryRole(user).name());out.put("roles",user.getRoles().stream().map(r->r.getName().name()).sorted().toList());out.put("createdAt",user.getCreatedAt());out.put("updatedAt",user.getUpdatedAt());out.put("revision",user.getRowVersion());return out;}
 @Transactional(readOnly=true) public Object list(String q,String state,RoleType role,int page){
  if(page<0||page>10000||!Set.of("ALL","ENABLED","DISABLED").contains(state))throw new IllegalArgumentException("Invalid filter");
  Specification<User> spec=Queries.search(q,"username","email","phone");
  if(!state.equals("ALL"))spec=spec.and((root,query,cb)->cb.equal(root.get("enabled"),state.equals("ENABLED")));
  if(role!=null)spec=spec.and((root,query,cb)->{
   var priority=List.of(RoleType.ADMIN,RoleType.EDITOR,RoleType.VIEWER,RoleType.USER);var higher=priority.subList(0,priority.indexOf(role));
   var selected=query.subquery(Long.class);var selectedUser=selected.from(User.class);var membership=selectedUser.join("roles");selected.select(selectedUser.get("id")).where(cb.equal(selectedUser.get("id"),root.get("id")),cb.equal(membership.get("name"),role));var matching=cb.exists(selected);
   if(higher.isEmpty())return matching;var excluded=query.subquery(Long.class);var excludedUser=excluded.from(User.class);var excludedRole=excludedUser.join("roles");excluded.select(excludedUser.get("id")).where(cb.equal(excludedUser.get("id"),root.get("id")),excludedRole.get("name").in(higher));return cb.and(matching,cb.not(cb.exists(excluded)));
  });
  return users.findAll(spec,PageRequest.of(page,20,Sort.by("createdAt").descending().and(Sort.by("id").descending()))).map(this::view);
 }
 @Transactional(readOnly=true) public Object stats(){long total=users.count(),enabled=users.countByEnabledTrue();return Map.of("total",total,"enabled",enabled,"disabled",total-enabled,"admins",users.activeAdmins());}
 @Transactional(readOnly=true) public Object detail(Long id){return view(users.findById(id).orElseThrow(ApiException::notFound));}
 private User actor(String username){
  // Serialize administrator changes across instances to protect the last active admin.
  jdbc.execute("select pg_advisory_xact_lock(742019301)");
  var actor=users.lockedByUsername(username).orElseThrow(ApiException::notFound);
  if(!actor.isEnabled()||!admin(actor))throw new ApiException(HttpStatus.FORBIDDEN,"Access denied");return actor;
 }
 private User target(Long id,long revision){var target=users.lockedById(id).orElseThrow(ApiException::notFound);if(target.getRowVersion()!=revision)throw new ApiException(HttpStatus.CONFLICT,"User changed; refresh and try again");return target;}
 @Transactional public Object update(Long id,UserAdminController.Update input,String username){
  var actor=actor(username);var user=target(id,input.revision());
  if(actor.getId().equals(id)&&(!input.enabled()||input.role()!=RoleType.ADMIN))throw new ApiException(HttpStatus.CONFLICT,"You cannot disable or demote your own account");
  if(user.isEnabled()&&admin(user)&&(!input.enabled()||input.role()!=RoleType.ADMIN)&&users.activeAdmins()<=1)throw new ApiException(HttpStatus.CONFLICT,"The last active administrator must remain enabled");
  String email=input.email().trim().toLowerCase(Locale.ROOT);users.findByEmailIgnoreCase(email).ifPresent(existing->{if(!existing.getId().equals(id))throw new ApiException(HttpStatus.CONFLICT,"Email is already in use");});
  String phone=input.phone()==null||input.phone().isBlank()?null:input.phone();
  if(user.getEmail().equals(email)&&Objects.equals(user.getPhone(),phone)&&user.isEnabled()==input.enabled()&&primaryRole(user)==input.role())return view(user);
  user.setEmail(email);user.setPhone(phone);user.setEnabled(input.enabled());if(primaryRole(user)!=input.role()){var assigned=new HashSet<dev.hexora.model.Role>();assigned.add(roles.findByName(RoleType.USER).orElseThrow());if(input.role()!=RoleType.USER)assigned.add(roles.findByName(input.role()).orElseThrow());user.setRoles(assigned);}user.setTokenVersion(user.getTokenVersion()+1);return view(users.saveAndFlush(user));
 }
 @Transactional public Object revoke(Long id,long revision,String username){actor(username);var user=target(id,revision);user.setTokenVersion(user.getTokenVersion()+1);return view(users.saveAndFlush(user));}
}
