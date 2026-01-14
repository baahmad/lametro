package com.lametro.lametro_tracker;

import com.lametro.lametro_tracker.config.RateLimitFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RateLimitFilterTest {

    private RateLimitFilter filter;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private FilterChain chain;
    private StringWriter responseWriter;

    @BeforeEach
    void setUp() throws Exception {
        filter = new RateLimitFilter();
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        chain = mock(FilterChain.class);
        responseWriter = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(responseWriter));
    }

    @Test
    void allowsRequestsUnderPerIpLimit() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/vehicles");
        when(request.getHeader("X-Forwarded-For")).thenReturn("192.168.1.1");

        // Make 100 requests (the limit).
        for (int i = 0; i < 100; i++) {
            filter.doFilter(request, response, chain);
        }

        // All 100 requests should pass through to the chain.
        verify(chain, times(100)).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }

    @Test
    void blocksRequestsOverPerIpLimit() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/vehicles");
        when(request.getHeader("X-Forwarded-For")).thenReturn("192.168.1.2");

        // Make 101 requests (1 over the limit).
        for (int i = 0; i < 101; i++) {
            filter.doFilter(request, response, chain);
        }

        // First 100 should pass, 101st should be blocked.
        verify(chain, times(100)).doFilter(request, response);
        verify(response, times(1)).setStatus(429);
    }

    @Test
    void differentIpsHaveSeparateLimits() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/vehicles");

        // First IP makes 100 requests.
        when(request.getHeader("X-Forwarded-For")).thenReturn("10.0.0.1");
        for (int i = 0; i < 100; i++) {
            filter.doFilter(request, response, chain);
        }

        // Second IP also makes 100 requests.
        when(request.getHeader("X-Forwarded-For")).thenReturn("10.0.0.2");
        for (int i = 0; i < 100; i++) {
            filter.doFilter(request, response, chain);
        }

        // All 200 requests should pass (100 per IP).
        verify(chain, times(200)).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }

    @Test
    void globalLimitBlocksWhenExceeded() throws Exception {
        // Create fresh mocks and filter for this test to avoid interference from other tests.
        RateLimitFilter freshFilter = new RateLimitFilter();
        HttpServletRequest freshRequest = mock(HttpServletRequest.class);
        HttpServletResponse freshResponse = mock(HttpServletResponse.class);
        FilterChain freshChain = mock(FilterChain.class);
        when(freshResponse.getWriter()).thenReturn(new PrintWriter(new StringWriter()));

        when(freshRequest.getRequestURI()).thenReturn("/api/vehicles");

        // Make 1100 requests from different IPs to hit the global limit (1000).
        // We use 1100 to ensure we clearly exceed the limit even with greedy refill.
        for (int i = 0; i < 1100; i++) {
            // Generate unique IPs: 10.x.y.z where x, y, z vary.
            int a = (i / 65536) % 256;
            int b = (i / 256) % 256;
            int c = i % 256;
            when(freshRequest.getHeader("X-Forwarded-For")).thenReturn("10." + a + "." + b + "." + c);
            freshFilter.doFilter(freshRequest, freshResponse, freshChain);
        }

        // With greedy refill, a few extra requests may slip through during fast execution.
        // The important thing is that some requests are blocked (at least ~100 of the 1100).
        verify(freshResponse, atLeast(50)).setStatus(429);
    }

    @Test
    void nonApiEndpointsAreNotRateLimited() throws Exception {
        when(request.getRequestURI()).thenReturn("/health");
        when(request.getHeader("X-Forwarded-For")).thenReturn("192.168.1.3");

        // Make many requests to a non-API endpoint.
        for (int i = 0; i < 200; i++) {
            filter.doFilter(request, response, chain);
        }

        // All should pass without rate limiting.
        verify(chain, times(200)).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }

    @Test
    void usesRemoteAddrWhenNoForwardedHeader() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/vehicles");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        filter.doFilter(request, response, chain);

        verify(chain, times(1)).doFilter(request, response);
    }

    @Test
    void cleanupRemovesOldBuckets() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/vehicles");
        when(request.getHeader("X-Forwarded-For")).thenReturn("192.168.1.100");

        // Make a request to create a bucket.
        filter.doFilter(request, response, chain);

        // Get access to the ipBuckets map via reflection.
        Field ipBucketsField = RateLimitFilter.class.getDeclaredField("ipBuckets");
        ipBucketsField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, Object> ipBuckets = (Map<String, Object>) ipBucketsField.get(filter);

        // Verify bucket was created.
        assertEquals(1, ipBuckets.size());
        assertTrue(ipBuckets.containsKey("192.168.1.100"));

        // Get the bucket and manually set its lastAccess to 10 minutes ago.
        Object bucketWithTimestamp = ipBuckets.get("192.168.1.100");
        Field lastAccessField = bucketWithTimestamp.getClass().getDeclaredField("lastAccess");
        lastAccessField.setAccessible(true);
        lastAccessField.set(bucketWithTimestamp, Instant.now().minus(Duration.ofMinutes(10)));

        // Manually trigger cleanup.
        Method cleanupMethod = RateLimitFilter.class.getDeclaredMethod("cleanupOldBuckets");
        cleanupMethod.setAccessible(true);
        cleanupMethod.invoke(filter);

        // Bucket should be removed.
        assertEquals(0, ipBuckets.size());
    }

    @Test
    void cleanupKeepsRecentBuckets() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/vehicles");
        when(request.getHeader("X-Forwarded-For")).thenReturn("192.168.1.101");

        // Make a request to create a bucket.
        filter.doFilter(request, response, chain);

        // Get access to the ipBuckets map via reflection.
        Field ipBucketsField = RateLimitFilter.class.getDeclaredField("ipBuckets");
        ipBucketsField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, Object> ipBuckets = (Map<String, Object>) ipBucketsField.get(filter);

        // Verify bucket was created.
        assertEquals(1, ipBuckets.size());

        // Manually trigger cleanup (bucket was just created, so it's recent).
        Method cleanupMethod = RateLimitFilter.class.getDeclaredMethod("cleanupOldBuckets");
        cleanupMethod.setAccessible(true);
        cleanupMethod.invoke(filter);

        // Bucket should still exist (it's recent).
        assertEquals(1, ipBuckets.size());
    }
}
