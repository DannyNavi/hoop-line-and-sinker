package com.hooplineandsinker.api.video;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class VideoService {

  private static final long MAX_BYTES = 100L * 1024L * 1024L; // 100 MB
  private static final List<String> ALLOWED_TYPES = List.of(
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo"
  );

  private final Path uploadRoot;
  private final String publicBaseUrl;
  private final Map<String, StoredVideo> store = new ConcurrentHashMap<>();

  public VideoService(
      @Value("${app.upload-dir:uploads}") String uploadDir,
      @Value("${app.public-base-url:http://localhost:8080}") String publicBaseUrl
  ) throws IOException {
    this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
    this.publicBaseUrl = publicBaseUrl.replaceAll("/$", "");
    Files.createDirectories(this.uploadRoot);
  }

  public VideoMeta save(MultipartFile file) throws IOException {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("File is required");
    }
    if (file.getSize() > MAX_BYTES) {
      throw new IllegalArgumentException("File exceeds 100MB limit");
    }

    String contentType = file.getContentType() == null ? "application/octet-stream" : file.getContentType();
    String original = file.getOriginalFilename() == null ? "clip.mp4" : file.getOriginalFilename();
    String lower = original.toLowerCase();
    boolean okExt = lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov") || lower.endsWith(".avi");
    if (!ALLOWED_TYPES.contains(contentType) && !okExt) {
      throw new IllegalArgumentException("Only mp4, webm, mov, or avi videos are allowed");
    }

    String id = UUID.randomUUID().toString();
    String ext = extensionFor(original, contentType);
    Path dest = uploadRoot.resolve(id + ext);
    Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

    StoredVideo stored = new StoredVideo(id, original, contentType, file.getSize(), Instant.now(), dest);
    store.put(id, stored);
    return toMeta(stored);
  }

  public List<VideoMeta> list() {
    List<VideoMeta> out = new ArrayList<>();
    for (StoredVideo v : store.values()) {
      out.add(toMeta(v));
    }
    out.sort(Comparator.comparing(VideoMeta::createdAt).reversed());
    return out;
  }

  public StoredVideo require(String id) {
    StoredVideo v = store.get(id);
    if (v == null) {
      throw new IllegalArgumentException("Video not found");
    }
    return v;
  }

  public Resource loadAsResource(String id) throws IOException {
    StoredVideo v = require(id);
    Resource resource = new UrlResource(v.path().toUri());
    if (!resource.exists() || !resource.isReadable()) {
      throw new IOException("Could not read video file");
    }
    return resource;
  }

  public MediaType mediaType(StoredVideo video) {
    try {
      return MediaType.parseMediaType(video.contentType());
    } catch (Exception e) {
      return MediaType.APPLICATION_OCTET_STREAM;
    }
  }

  private VideoMeta toMeta(StoredVideo video) {
    String url = publicBaseUrl + "/api/videos/" + video.id() + "/file";
    return new VideoMeta(
        video.id(),
        video.originalName(),
        video.contentType(),
        video.sizeBytes(),
        video.createdAt(),
        url
    );
  }

  private static String extensionFor(String original, String contentType) {
    int dot = original.lastIndexOf('.');
    if (dot >= 0) {
      return original.substring(dot).toLowerCase();
    }
    return switch (contentType) {
      case "video/webm" -> ".webm";
      case "video/quicktime" -> ".mov";
      case "video/x-msvideo" -> ".avi";
      default -> ".mp4";
    };
  }

  public record StoredVideo(
      String id,
      String originalName,
      String contentType,
      long sizeBytes,
      Instant createdAt,
      Path path
  ) {}
}
