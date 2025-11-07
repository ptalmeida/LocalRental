package middleware

import (
	"net/http"

	"localRental/pkg/config"
)

// Authenticate wraps an HTTP handler with basic authentication
// Uses credentials from the provided configuration
func Authenticate(cfg *config.Config) func(http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user, pass, ok := r.BasicAuth()
			if ok && user == cfg.Auth.Username && pass == cfg.Auth.Password {
				h.ServeHTTP(w, r)
				return
			}

			w.Header().Set("WWW-Authenticate", `Basic realm="Restricted"`)
			w.WriteHeader(http.StatusUnauthorized)
		})
	}
}
