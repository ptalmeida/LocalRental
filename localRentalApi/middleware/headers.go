package middleware

import (
	"net/http"
)

// ServerHeader adds a Server header to all responses
func ServerHeader(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Server", "Go")
		next.ServeHTTP(w, r)
	})
}
