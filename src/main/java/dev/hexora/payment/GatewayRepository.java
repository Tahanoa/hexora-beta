package dev.hexora.payment;
import org.springframework.data.jpa.repository.JpaRepository;
public interface GatewayRepository extends JpaRepository<GatewaySettings,Long> {}
