package middleware

import (
	"net/http"
)

// Authenticate wraps an HTTP handler with basic authentication
func Authenticate(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user, pass, ok := r.BasicAuth()
		if ok && user == "user" && pass == "pass" {
			h.ServeHTTP(w, r)
			return
		}

		w.WriteHeader(http.StatusUnauthorized)
	})
}
