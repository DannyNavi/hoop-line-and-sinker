# Video API (Spring Boot)

Java 21 + Spring Boot 3 service that stores uploaded shooting clips for Hoop, Line & Sinker.

Pose analysis still runs in the browser with MediaPipe. This API is for **persistence**.

## Run

```bash
mvn spring-boot:run
```

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/videos` | multipart form field `file` |
| GET | `/api/videos` | list metadata |
| GET | `/api/videos/{id}/file` | stream bytes |
| GET | `/api/videos/health` | health check |

Default port: `8080`
