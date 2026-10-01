package dev.hexora.repository;
import dev.hexora.model.Testimonial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;
import java.util.List;
public interface TestimonialRepository extends JpaRepository<Testimonial,Long>{List<Testimonial> findByPublishedTrue(Sort sort);}
