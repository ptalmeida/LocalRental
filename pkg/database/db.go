package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
)

// Config holds database configuration
type Config struct {
	ConnectionString string
	MaxOpenConns     int
	MaxIdleConns     int
	ConnMaxLifetime  time.Duration
}

// DefaultConfig returns default database configuration
func DefaultConfig() Config {
	return Config{
		ConnectionString: "postgres://localhost/alojamentos?sslmode=disable",
		MaxOpenConns:     25,
		MaxIdleConns:     5,
		ConnMaxLifetime:  5 * time.Minute,
	}
}

// InitDB initializes and returns a database connection pool
func InitDB(config Config) (*sql.DB, error) {
	db, err := sql.Open("postgres", config.ConnectionString)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(config.MaxOpenConns)
	db.SetMaxIdleConns(config.MaxIdleConns)
	db.SetConnMaxLifetime(config.ConnMaxLifetime)

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Database connection pool initialized")
	return db, nil
}

// HealthCheck performs a database health check
func HealthCheck(db *sql.DB) error {
	return db.Ping()
}

// Close closes the database connection
func Close(db *sql.DB) error {
	if err := db.Close(); err != nil {
		return fmt.Errorf("failed to close database: %w", err)
	}
	log.Println("Database connection closed")
	return nil
}
