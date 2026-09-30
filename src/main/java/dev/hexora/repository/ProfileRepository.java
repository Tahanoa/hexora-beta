package dev.hexora.repository;
import dev.hexora.model.Profile;
import dev.hexora.enums.*;
import java.util.*;
import java.time.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
public interface ProfileRepository extends JpaRepository<Profile, Long>, JpaSpecificationExecutor<Profile> {
 Optional<Profile> findFirstByOrderByCreatedAtDescIdDesc();
 Optional<Profile> findByEmail(String email);
 Optional<Profile> findByBrandName(String brandName);
}
