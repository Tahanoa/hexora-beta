package dev.hexora.repository;
import dev.hexora.model.Project;
import dev.hexora.enums.*;
import java.util.*;
import java.time.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {
 Optional<Project> findBySlug(String slug);
 List<Project> findByStatus(ProjectStatus status);
 long countByStatus(ProjectStatus status);
 List<Project> findByProjectDateBetween(LocalDateTime start, LocalDateTime end);
}
