package dev.hexora.model;
import jakarta.persistence.*; import java.util.*;
@Entity @Table(name="users")
public class User extends BaseEntity {
 @Column(nullable=false,unique=true,length=50) private String username;
 @Column(nullable=false,length=100) private String password;
 @Column(nullable=false,unique=true,length=150) private String email;
 @Column(nullable=false) private boolean enabled=true;
 @ManyToMany(fetch=FetchType.EAGER) @JoinTable(name="user_roles",joinColumns=@JoinColumn(name="user_id"),inverseJoinColumns=@JoinColumn(name="role_id")) private Set<Role> roles=new HashSet<>();
 public String getUsername(){return username;} public void setUsername(String v){username=v;}
 public String getPassword(){return password;} public void setPassword(String v){password=v;}
 public String getEmail(){return email;} public void setEmail(String v){email=v;}
 public boolean isEnabled(){return enabled;} public void setEnabled(boolean v){enabled=v;}
 public Set<Role> getRoles(){return roles;} public void setRoles(Set<Role> v){roles=v;}
}
