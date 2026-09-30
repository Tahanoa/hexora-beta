# Hexora Beta

Modern rebuild of the Hexora personal-brand portfolio and administration web app.

## Stack

- Spring Boot 4.1.1 / Spring Framework 7
- Java 17+
- Spring MVC, Spring Security, Spring Data JPA
- Thymeleaf templates retained from the original project
- PostgreSQL in production, H2 file database for local startup
- Flyway versioned schema migrations

## Run locally

```bash
export JWT_SECRET_UNUSED=true
./mvnw spring-boot:run
```

The local default uses H2 at `./data/hexora`. No database password or hard-coded administrator is created. For an initial administrator, set `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` before first run.

For PostgreSQL, set `SPRING_PROFILES_ACTIVE=prod`, `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, and `COOKIE_SECURE=true` behind HTTPS.

## API compatibility

Public portfolio routes remain under `/api/profile/public`, `/api/projects/public`, `/api/skills/public`, `/api/services/public`, `/api/experience/public`, `/api/statistics/public`, and `/api/media/public/{id}`. Administration routes remain under their existing `/api/...` namespaces and require an authenticated session.
