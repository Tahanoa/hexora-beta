package dev.hexora.repository;
import dev.hexora.model.BusinessService;
import dev.hexora.enums.*;
import java.util.*;
import java.time.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
public interface BusinessServiceRepository extends JpaRepository<BusinessService, Long>, JpaSpecificationExecutor<BusinessService> {
 Optional<BusinessService> findBySlug(String slug);
 Optional<BusinessService> findByTitle(String title);
}
