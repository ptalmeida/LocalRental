package cmd

import (
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"

	_ "localRental/docs" // Import generated docs
	"localRental/handlers"
	"localRental/middleware"
	"localRental/pkg/config"
	"localRental/pkg/database"

	httpSwagger "github.com/swaggo/http-swagger"
)

// Execute starts the HTTP server with configured routes and middleware
func Execute() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize database with configuration
	dbConfig := database.Config{
		ConnectionString: cfg.Database.URL,
		MaxOpenConns:     cfg.Database.MaxOpenConns,
		MaxIdleConns:     cfg.Database.MaxIdleConns,
		ConnMaxLifetime:  cfg.Database.ConnMaxLifetime,
	}

	db, err := database.InitDB(dbConfig)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close(db)

	// Initialize router and logger
	mux := http.NewServeMux()
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	// Health check endpoints (no authentication required)
	mux.HandleFunc("GET /health", handlers.HealthCheck)
	mux.HandleFunc("GET /ready", handlers.ReadinessCheck)

	// Register routes - alojamentos endpoints
	mux.HandleFunc("GET /alojamentos", handlers.GetAlojamentos)
	mux.HandleFunc("GET /alojamentos/{id}", handlers.GetAlojamentoByID)
	mux.HandleFunc("GET /alojamentos/search", handlers.SearchAlojamentos)
	mux.HandleFunc("GET /alojamentos/stats", handlers.GetAlojamentosStats)

	// Swagger documentation
	mux.HandleFunc("/swagger/", httpSwagger.WrapHandler)

	// Apply middleware chain: DatabaseMiddleware -> RateLimit -> ServerHeader -> LogRequest
	server := middleware.DatabaseMiddleware(db)(
		middleware.RateLimit(cfg.RateLimit.RequestsPerSecond, cfg.RateLimit.Burst)(
			middleware.ServerHeader(
				middleware.LogRequest(logger, mux),
			),
		),
	)

	// Start server
	addr := fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port)
	logger.Info("starting server", "address", addr, "environment", cfg.Env)
	if err := http.ListenAndServe(addr, server); err != nil {
		logger.Error("server failed to start", "error", err)
		os.Exit(1)
	}
}
