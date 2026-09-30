package dev.hexora.repository;
import dev.hexora.model.Experience;
import dev.hexora.enums.*;
import java.util.*;
import java.time.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
public interface ExperienceRepository extends JpaRepository<Experience, Long>, JpaSpecificationExecutor<Experience> {
 Optional<Experience> findFirstByIsCurrentTrueOrderByStartDateDescIdDesc();
 List<Experience> findByIsCurrentFalseOrderByEndDateDesc();
 List<Experience> findByCompanyContainingIgnoreCase(String company);
 List<Experience> findByStartDateBetween(LocalDate start, LocalDate end);
}
