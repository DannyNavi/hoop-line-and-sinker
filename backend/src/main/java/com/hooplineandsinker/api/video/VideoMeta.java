package com.hooplineandsinker.api.video;

import java.time.Instant;

public record VideoMeta(
    String id,
    String originalName,
    String contentType,
    long sizeBytes,
    Instant createdAt,
    String url
) {}
