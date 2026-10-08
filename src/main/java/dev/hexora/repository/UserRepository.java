package dev.hexora.repository;
import dev.hexora.model.User; import org.springframework.data.jpa.repository.JpaRepository; import java.util.Optional;
public interface UserRepository extends JpaRepository<User,Long>,org.springframework.data.jpa.repository.JpaSpecificationExecutor<User>{
 @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
 @org.springframework.data.jpa.repository.Query("select u from User u where lower(u.username)=lower(:username)")
 Optional<User> lockedByUsername(@org.springframework.data.repository.query.Param("username") String username);
 @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
 @org.springframework.data.jpa.repository.Query("select u from User u where u.id=:id")
 Optional<User> lockedById(@org.springframework.data.repository.query.Param("id") Long id);
 long countByEnabledTrue();
 @org.springframework.data.jpa.repository.Query("select count(distinct u.id) from User u join u.roles r where u.enabled=true and r.name=dev.hexora.enums.RoleType.ADMIN")
 long activeAdmins();
 Optional<User> findByUsernameIgnoreCase(String username); Optional<User> findByEmailIgnoreCase(String email); boolean existsByUsernameIgnoreCase(String username); boolean existsByEmailIgnoreCase(String email);}
