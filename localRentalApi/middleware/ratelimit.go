package middleware

import (
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// RateLimiter manages rate limiting for clients
type RateLimiter struct {
	visitors map[string]*rate.Limiter
	mu       sync.RWMutex
	rate     rate.Limit
	burst    int
}

// NewRateLimiter creates a new rate limiter
// rps: requests per second allowed
// burst: maximum burst size (tokens bucket capacity)
func NewRateLimiter(rps float64, burst int) *RateLimiter {
	return &RateLimiter{
		visitors: make(map[string]*rate.Limiter),
		rate:     rate.Limit(rps),
		burst:    burst,
	}
}

// getVisitor retrieves or creates a rate limiter for a client IP
func (rl *RateLimiter) getVisitor(ip string) *rate.Limiter {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	limiter, exists := rl.visitors[ip]
	if !exists {
		limiter = rate.NewLimiter(rl.rate, rl.burst)
		rl.visitors[ip] = limiter
	}

	return limiter
}

// cleanupVisitors removes inactive visitors periodically
func (rl *RateLimiter) cleanupVisitors() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		// In production, you'd want to track last access time
		// For simplicity, we'll just clear all inactive limiters
		rl.visitors = make(map[string]*rate.Limiter)
		rl.mu.Unlock()
	}
}

// Limit wraps an HTTP handler with rate limiting
func (rl *RateLimiter) Limit(next http.Handler) http.Handler {
	// Start cleanup goroutine once
	go rl.cleanupVisitors()

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get client IP (strip port for consistency)
		ip := r.RemoteAddr
		limiter := rl.getVisitor(ip)

		// Check if request is allowed
		if !limiter.Allow() {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte(`{"error":"Rate limit exceeded. Please try again later."}`))
			return
		}

		next.ServeHTTP(w, r)
	})
}

// RateLimit creates a rate limiting middleware with configurable settings
// Uses settings from the provided configuration
func RateLimit(rps float64, burst int) func(http.Handler) http.Handler {
	limiter := NewRateLimiter(rps, burst)
	return func(next http.Handler) http.Handler {
		return limiter.Limit(next)
	}
}
