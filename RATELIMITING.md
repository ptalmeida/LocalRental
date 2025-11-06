# Rate Limiting

Your API is protected by rate limiting middleware to prevent abuse and ensure fair usage for all clients.

## Configuration

**Default Settings:**
- **Rate**: 10 requests per second
- **Burst**: 20 requests

This uses a **token bucket** algorithm, which allows:
- Sustained rate of 10 req/s
- Burst capacity of 20 tokens (allows temporary spikes)
- Per-client IP tracking

## How It Works

### Token Bucket Algorithm

1. Each client IP gets its own token bucket
2. Bucket starts with 20 tokens (burst capacity)
3. Tokens refill at 10 per second
4. Each request consumes 1 token
5. If no tokens available → **429 Too Many Requests**

### Example Scenarios

**Scenario 1: Normal Usage**
- Client makes 5 req/s → All succeed ✓
- Well within the 10 req/s limit

**Scenario 2: Burst Traffic**
- Client makes 20 requests instantly → All succeed ✓
- Then makes 5 more immediately → First 0 succeed, next 5 may be rate limited ⚠
- Bucket was emptied by burst, needs time to refill

**Scenario 3: Sustained Overload**
- Client makes 50 requests instantly → First 20 succeed, rest fail with 429 ✗
- Bucket capacity is 20, can't handle 50 simultaneous requests

## Rate Limit Response

When rate limited, clients receive:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": "Rate limit exceeded. Please try again later."
}
```

## Implementation

### Middleware Location

Rate limiting is the **first middleware** in the chain:

```go
// middleware/ratelimit.go
server := middleware.RateLimit(
    middleware.ServerHeader(
        middleware.LogRequest(logger, mux)
    )
)
```

This ensures rate limiting happens **before** any other processing, minimizing server load from abusive clients.

### Per-IP Tracking

Each client IP address gets its own rate limiter:

```go
// Tracked by RemoteAddr (includes port)
ip := r.RemoteAddr  // e.g., "127.0.0.1:54321"
```

**Note**: In production behind a reverse proxy, you may want to use `X-Forwarded-For` or `X-Real-IP` headers instead of `RemoteAddr`.

### Memory Management

The rate limiter automatically cleans up inactive client limiters every 5 minutes to prevent memory leaks.

## Customizing Rate Limits

### Change Default Limits

Edit `middleware/ratelimit.go`:

```go
func RateLimit(next http.Handler) http.Handler {
    // Change these values:
    limiter := NewRateLimiter(10, 20)  // (rate, burst)
    return limiter.Limit(next)
}
```

**Parameters:**
- `rate` (float64): Requests per second
- `burst` (int): Maximum burst capacity

### Examples

**Stricter Limit** (for sensitive endpoints):
```go
limiter := NewRateLimiter(2, 5)  // 2 req/s, burst of 5
```

**More Permissive** (for public APIs):
```go
limiter := NewRateLimiter(100, 200)  // 100 req/s, burst of 200
```

### Different Limits for Different Routes

You can apply different rate limiters to different route groups:

```go
// Create multiple limiters
strictLimiter := middleware.NewRateLimiter(2, 5)
normalLimiter := middleware.NewRateLimiter(10, 20)

// Apply to specific routes
mux.Handle("/auth/login", strictLimiter.Limit(http.HandlerFunc(loginHandler)))
mux.Handle("/api/data", normalLimiter.Limit(http.HandlerFunc(dataHandler)))
```

## Production Considerations

### Behind a Reverse Proxy

If your API is behind nginx, Apache, or a cloud load balancer, use the real client IP:

```go
// Get real IP from proxy headers
func getRealIP(r *http.Request) string {
    if ip := r.Header.Get("X-Forwarded-For"); ip != "" {
        // X-Forwarded-For can contain multiple IPs
        return strings.Split(ip, ",")[0]
    }
    if ip := r.Header.Get("X-Real-IP"); ip != "" {
        return ip
    }
    return r.RemoteAddr
}

// Use in rate limiter
ip := getRealIP(r)
limiter := rl.getVisitor(ip)
```

### Distributed Systems

The current implementation uses in-memory storage. For multiple server instances, consider:

1. **Redis-based rate limiting** - Shared state across servers
2. **Sticky sessions** - Route same IP to same server
3. **API Gateway** - Let the gateway handle rate limiting (AWS API Gateway, Kong, etc.)

### Monitoring

Add metrics to track rate limiting:

```go
var rateLimitCounter = prometheus.NewCounter(
    prometheus.CounterOpts{
        Name: "api_rate_limit_hits_total",
        Help: "Total number of rate limit hits",
    },
)

// In rate limiter
if !limiter.Allow() {
    rateLimitCounter.Inc()
    // ... send 429 response
}
```

## Testing Rate Limits

### Manual Testing

**Test with curl:**
```bash
# Send rapid requests
for i in {1..30}; do
    curl -X POST http://localhost:8087/sum \
        -H "Content-Type: application/json" \
        -d '{"a": 1, "b": 2}' \
        -w "Status: %{http_code}\n" &
done | sort | uniq -c
```

Expected output (with burst=20):
```
20 Status: 200
10 Status: 429
```

### Load Testing

Use load testing tools to verify limits:

```bash
# With Apache Bench
ab -n 100 -c 10 http://localhost:8087/sum

# With wrk
wrk -t4 -c100 -d30s http://localhost:8087/sum

# With hey
hey -n 1000 -c 50 http://localhost:8087/sum
```

## Best Practices

1. **Set appropriate limits** - Balance protection vs usability
2. **Document limits** - Tell API consumers the limits
3. **Provide headers** - Return rate limit info in responses:
   ```
   X-RateLimit-Limit: 10
   X-RateLimit-Remaining: 5
   X-RateLimit-Reset: 1609459200
   ```
4. **Graceful degradation** - Don't crash on rate limit exhaustion
5. **Monitor and adjust** - Track 429 responses, adjust if needed
6. **Exempt trusted clients** - Whitelist IPs if needed

## Rate Limit Headers (Future Enhancement)

Consider adding these standard headers to responses:

```go
w.Header().Set("X-RateLimit-Limit", "10")
w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
w.Header().Set("X-RateLimit-Reset", fmt.Sprintf("%d", resetTime.Unix()))
```

This helps clients implement retry logic and backoff strategies.

## Security Benefits

Rate limiting protects against:

- **Brute force attacks** - Limits password guessing attempts
- **DDoS attacks** - Mitigates distributed denial of service
- **API scraping** - Prevents excessive data extraction
- **Resource exhaustion** - Protects server from overload
- **Cost control** - Reduces infrastructure costs from abuse

## Further Reading

- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)
- [golang.org/x/time/rate](https://pkg.go.dev/golang.org/x/time/rate) - Official Go rate limiter
- [RFC 6585](https://tools.ietf.org/html/rfc6585#section-4) - HTTP 429 Status Code
