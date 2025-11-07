package middleware

import (
	"context"
	"database/sql"
	"net/http"
)

// contextKey is a custom type for context keys to avoid collisions
type contextKey string

// dbContextKey is the key for storing database connection in request context
const dbContextKey contextKey = "database"

// DatabaseMiddleware adds database connection to request context
func DatabaseMiddleware(db *sql.DB) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Add database to request context
			ctx := context.WithValue(r.Context(), dbContextKey, db)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetDB retrieves database connection from request context
func GetDB(r *http.Request) (*sql.DB, bool) {
	db, ok := r.Context().Value(dbContextKey).(*sql.DB)
	return db, ok
}
