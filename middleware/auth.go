package middleware

import (
	"net/http"
)

// Authenticate wraps an HTTP handler with basic authentication
func Authenticate(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, pass, ok := r.BasicAuth()
		if ok && user == "john" && pass == "secret" {
			h.ServeHTTP(w, r)
			return
		}

		w.WriteHeader(http.StatusUnauthorized)
	}
}
