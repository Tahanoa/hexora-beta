package dev.hexora.repository;
import dev.hexora.enums.MediaType; import dev.hexora.model.Media; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface MediaRepository extends JpaRepository<Media,Long>{List<Media> findByTypeOrderByCreatedAtDesc(MediaType type); Optional<Media> findByFileName(String name);}
