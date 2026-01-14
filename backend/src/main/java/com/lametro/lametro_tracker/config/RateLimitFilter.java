package com.lametro.lametro_tracker.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitFilter implements Filter {

    // Global bucket: 1000 requests per minute for all users combined.
    private final Bucket globalBucket = Bucket.builder()
        .addLimit(Bandwidth.builder().capacity(1000).refillGreedy(1000, Duration.ofMinutes(1)).build())
        .build();

    // Per-IP buckets: 100 requests per minute per IP.
    // Each entry stores the bucket and the last access time.
    private final Map<String, BucketWithTimestamp> ipBuckets = new ConcurrentHashMap<>();

    // How long before an unused bucket is eligible for cleanup (5 minutes).
    private static final long BUCKET_EXPIRY_MINUTES = 5;

    // Background thread to clean up old buckets.
    private final ScheduledExecutorService cleanupScheduler = Executors.newSingleThreadScheduledExecutor();

    // Wrapper class to store bucket with last access time.
    private static class BucketWithTimestamp {
        final Bucket bucket;
        volatile Instant lastAccess;

        BucketWithTimestamp(Bucket bucket) {
            this.bucket = bucket;
            this.lastAccess = Instant.now();
        }

        void touch() {
            this.lastAccess = Instant.now();
        }
    }

    public RateLimitFilter() {
        // Run cleanup every 5 minutes.
        cleanupScheduler.scheduleAtFixedRate(this::cleanupOldBuckets, 5, 5, TimeUnit.MINUTES);
    }

    private void cleanupOldBuckets() {
        Instant cutoff = Instant.now().minus(Duration.ofMinutes(BUCKET_EXPIRY_MINUTES));
        ipBuckets.entrySet().removeIf(entry -> entry.getValue().lastAccess.isBefore(cutoff));
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Only rate limit API endpoints.
        if (!httpRequest.getRequestURI().startsWith("/api/")) {
            chain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(httpRequest);
        BucketWithTimestamp bucketWithTimestamp = ipBuckets.computeIfAbsent(clientIp, this::createIpBucket);
        bucketWithTimestamp.touch();  // Update last access time.

        // Check per-IP limit first (more likely to be hit by abusive users).
        if (!bucketWithTimestamp.bucket.tryConsume(1)) {
            httpResponse.setStatus(429);
            httpResponse.getWriter().write("Rate limit exceeded. Please try again later.");
            return;
        }

        // Then check global limit.
        if (!globalBucket.tryConsume(1)) {
            httpResponse.setStatus(429);
            httpResponse.getWriter().write("Rate limit exceeded. Please try again later.");
            return;
        }

        chain.doFilter(request, response);
    }

    private BucketWithTimestamp createIpBucket(String ip) {
        Bucket bucket = Bucket.builder()
            .addLimit(Bandwidth.builder().capacity(100).refillGreedy(100, Duration.ofMinutes(1)).build())
            .build();
        return new BucketWithTimestamp(bucket);
    }

    private String getClientIp(HttpServletRequest request) {
        // Check X-Forwarded-For header (set by ALB).
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isEmpty()) {
            // X-Forwarded-For can contain multiple IPs; first one is the client.
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}