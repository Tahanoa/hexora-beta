# Hexora Beta

Modern rebuild of the Hexora personal-brand portfolio and administration web app.

## Stack

- Spring Boot 4.1.1 / Spring Framework 7
- Java 17+
- Spring MVC, Spring Security, Spring Data JPA
- Thymeleaf templates retained from the original project
- PostgreSQL 16+ as the only supported database
- Flyway versioned schema migrations

## Run locally

PostgreSQL is required. Create a database named `hexora`, then provide its connection settings through environment variables:

```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/hexora
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=postgres
./mvnw spring-boot:run
```

The application runs Flyway migrations against PostgreSQL on startup. No database password or hard-coded administrator is created. For an initial administrator, set `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` before first run.

For a production deployment, set `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, and `COOKIE_SECURE=true` behind HTTPS. The `prod` profile remains available for production-only overrides.

## API compatibility

Public portfolio routes remain under `/api/profile/public`, `/api/projects/public`, `/api/skills/public`, `/api/services/public`, `/api/experience/public`, `/api/statistics/public`, and `/api/media/public/{id}`. Administration routes remain under their existing `/api/...` namespaces and require an authenticated session.
