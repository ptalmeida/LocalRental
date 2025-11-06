package cmd

import (
	"log"
	"log/slog"
	"net/http"
	"os"

	_ "pedroAPI/docs" // Import generated docs
	"pedroAPI/handlers"
	"pedroAPI/middleware"
	"pedroAPI/pkg/database"

	httpSwagger "github.com/swaggo/http-swagger"
)

// Execute starts the HTTP server with configured routes and middleware
func Execute() {
	// Initialize database
	dbConfig := database.DefaultConfig()
	// Override with environment variable if set
	if connStr := os.Getenv("DATABASE_URL"); connStr != "" {
		dbConfig.ConnectionString = connStr
	}

	db, err := database.InitDB(dbConfig)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close(db)

	// Initialize router and logger
	mux := http.NewServeMux()
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	// Register routes - alojamentos endpoints
	mux.HandleFunc("/admin", middleware.Authenticate(handlers.AdminHandler))
	mux.HandleFunc("GET /alojamentos", handlers.GetAlojamentos)
	mux.HandleFunc("GET /alojamentos/{id}", handlers.GetAlojamentoByID)
	mux.HandleFunc("GET /alojamentos/search", handlers.SearchAlojamentos)
	mux.HandleFunc("GET /alojamentos/stats", handlers.GetAlojamentosStats)

	// Swagger documentation
	mux.HandleFunc("/swagger/", httpSwagger.WrapHandler)

	// Apply middleware chain: DatabaseMiddleware -> RateLimit -> ServerHeader -> LogRequest
	server := middleware.DatabaseMiddleware(db)(
		middleware.RateLimit(
			middleware.ServerHeader(
				middleware.LogRequest(logger, mux),
			),
		),
	)

	// Start server
	logger.Info("listening in port 8087")
	if err := http.ListenAndServe(":8087", server); err != nil {
		logger.Error("server failed to start", "error", err)
		os.Exit(1)
	}
}
