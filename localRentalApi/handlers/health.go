package handlers

import (
	"net/http"
	"time"

	"localRental/middleware"
)

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
}

// ReadinessResponse represents the readiness check response
type ReadinessResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Database  string    `json:"database"`
}

// HealthCheck is a basic health check endpoint
// Returns 200 OK if the service is running
// @Summary Health check
// @Description Returns the health status of the service
// @Tags health
// @Produce json
// @Success 200 {object} HealthResponse
// @Router /health [get]
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now(),
	}
	RespondWithJSON(w, http.StatusOK, response)
}

// ReadinessCheck checks if the service is ready to serve traffic
// Includes database connectivity check
// @Summary Readiness check
// @Description Returns the readiness status of the service including database connectivity
// @Tags health
// @Produce json
// @Success 200 {object} ReadinessResponse
// @Failure 503 {object} ReadinessResponse
// @Router /ready [get]
func ReadinessCheck(w http.ResponseWriter, r *http.Request) {
	response := ReadinessResponse{
		Status:    "ready",
		Timestamp: time.Now(),
		Database:  "connected",
	}

	// Check database connection
	db, ok := middleware.GetDB(r)
	if !ok {
		response.Status = "not ready"
		response.Database = "not configured"
		RespondWithJSON(w, http.StatusServiceUnavailable, response)
		return
	}

	// Ping database to verify connection
	if err := db.Ping(); err != nil {
		response.Status = "not ready"
		response.Database = "disconnected"
		RespondWithJSON(w, http.StatusServiceUnavailable, response)
		return
	}

	RespondWithJSON(w, http.StatusOK, response)
}
