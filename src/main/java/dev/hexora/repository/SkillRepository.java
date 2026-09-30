package dev.hexora.repository;
import dev.hexora.model.Skill;
import dev.hexora.enums.*;
import java.util.*;
import java.time.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
public interface SkillRepository extends JpaRepository<Skill, Long>, JpaSpecificationExecutor<Skill> {
 List<Skill> findByCategoryOrderByLevelDesc(SkillCategory category);
 Optional<Skill> findByName(String name);
}
