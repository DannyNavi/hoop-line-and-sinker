package com.hooplineandsinker.api.video;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

  private final VideoService videoService;

  public VideoController(VideoService videoService) {
    this.videoService = videoService;
  }

  @PostMapping
  public ResponseEntity<VideoMeta> upload(@RequestParam("file") MultipartFile file) throws IOException {
    return ResponseEntity.status(HttpStatus.CREATED).body(videoService.save(file));
  }

  @GetMapping
  public List<VideoMeta> list() {
    return videoService.list();
  }

  @GetMapping("/{id}/file")
  public ResponseEntity<Resource> file(@PathVariable String id) throws IOException {
    VideoService.StoredVideo meta = videoService.require(id);
    Resource resource = videoService.loadAsResource(id);
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + meta.originalName() + "\"")
        .contentType(videoService.mediaType(meta))
        .body(resource);
  }

  @GetMapping("/health")
  public Map<String, String> health() {
    return Map.of("status", "ok");
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException ex) {
    return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
  }
}
