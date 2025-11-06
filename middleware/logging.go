package middleware

import (
	"log/slog"
	"net/http"
)

// LogRequest wraps an HTTP handler with request logging
func LogRequest(logger *slog.Logger, handler http.Handler) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handler.ServeHTTP(w, r)
		logger.Info("handled request",
			"method", r.Method,
			"path", r.URL.Path,
			"remote_addr", r.RemoteAddr,
			"user_agent", r.UserAgent(),
		)
	})
}
