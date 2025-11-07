# Rate Limiting

The API uses rate limiting to prevent abuse and ensure fair usage.

## Configuration

Configure via environment variables (see `.env.example`):
- `RATE_LIMIT_REQUESTS_PER_SECOND` - Requests per second (default: 10)
- `RATE_LIMIT_BURST` - Burst capacity (default: 20)

## How It Works

Uses a **token bucket algorithm**:
- Each client IP gets its own bucket
- Bucket refills at the configured rate per second
- Each request consumes 1 token
- When empty → **429 Too Many Requests**

## Examples

**Normal usage:** 5 req/s → All succeed ✓

**Burst traffic:** 20 instant requests → All succeed, but bucket needs time to refill

**Sustained overload:** 50 instant requests → First 20 succeed, rest fail with 429

## Rate Limit Response

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": "Rate limit exceeded. Please try again later."
}
```

## Implementation

See `middleware/ratelimit.go` for the implementation.

Rate limiting is applied before other middleware to minimize server load from abusive clients.

## Testing

```bash
# Test with rapid requests
for i in {1..30}; do
    curl http://localhost:8087/alojamentos?limit=1 &
done
```

## Production Considerations

- **Behind reverse proxy?** Configure to use `X-Forwarded-For` or `X-Real-IP` headers
- **Multiple servers?** Consider Redis-based rate limiting for shared state
- **Monitoring:** Track 429 responses to adjust limits
- **Headers:** Consider adding `X-RateLimit-*` headers for client-side retry logic

## Security Benefits

Protects against:
- Brute force attacks
- DDoS attacks
- API scraping
- Resource exhaustion

## References

- Implementation: `middleware/ratelimit.go`
- Configuration: `pkg/config/config.go`
- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)
- [golang.org/x/time/rate](https://pkg.go.dev/golang.org/x/time/rate)
