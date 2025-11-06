package handlers

import (
	"net/http"
)

// AdminHandler handles requests to the admin endpoint
// @Summary      Admin access
// @Description  Access admin area (requires authentication)
// @Tags         Admin
// @Produce      plain
// @Success      200 {string} string "admin"
// @Failure      401 {string} string "Unauthorized"
// @Security     BasicAuth
// @Router       /admin [get]
func AdminHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("admin"))
}
