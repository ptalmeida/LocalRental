package handlers

import (
	"encoding/json"
	"net/http"

	"localRental/models"
)

// RespondWithJSON sends a JSON response with the given status code
func RespondWithJSON(w http.ResponseWriter, code int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(payload)
}

// RespondWithError sends an error response
func RespondWithError(w http.ResponseWriter, code int, message string) {
	RespondWithJSON(w, code, models.ErrorResponse{
		Error: message,
	})
}

// RespondWithValidationError sends a validation error response
func RespondWithValidationError(w http.ResponseWriter, message string, details map[string]string) {
	RespondWithJSON(w, http.StatusBadRequest, models.ErrorResponse{
		Error:   message,
		Details: details,
	})
}
