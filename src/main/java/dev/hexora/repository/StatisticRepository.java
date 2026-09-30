package dev.hexora.repository;
import dev.hexora.model.Statistic;
import dev.hexora.enums.*;
import java.util.*;
import java.time.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
public interface StatisticRepository extends JpaRepository<Statistic, Long>, JpaSpecificationExecutor<Statistic> {
 Optional<Statistic> findByTitle(String title);
}
