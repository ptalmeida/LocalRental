package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all application configuration
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Auth     AuthConfig
	RateLimit RateLimitConfig
	Env      string
}

// ServerConfig holds server-related configuration
type ServerConfig struct {
	Port string
	Host string
}

// DatabaseConfig holds database connection configuration
type DatabaseConfig struct {
	URL             string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
}

// AuthConfig holds authentication configuration
type AuthConfig struct {
	Username string
	Password string
}

// RateLimitConfig holds rate limiting configuration
type RateLimitConfig struct {
	RequestsPerSecond float64
	Burst             int
}

// Load loads configuration from environment variables
// It will attempt to load .env file if it exists (useful for local development)
func Load() (*Config, error) {
	// Try to load .env file (ignore error if file doesn't exist - ok for production)
	_ = godotenv.Load()

	config := &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8087"),
			Host: getEnv("HOST", "0.0.0.0"),
		},
		Database: DatabaseConfig{
			URL:             getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/alojamentos?sslmode=disable"),
			MaxOpenConns:    getEnvAsInt("DB_MAX_OPEN_CONNS", 25),
			MaxIdleConns:    getEnvAsInt("DB_MAX_IDLE_CONNS", 5),
			ConnMaxLifetime: getEnvAsDuration("DB_CONN_MAX_LIFETIME", 5*time.Minute),
		},
		Auth: AuthConfig{
			Username: getEnv("AUTH_USERNAME", "admin"),
			Password: getEnv("AUTH_PASSWORD", "changeme123"),
		},
		RateLimit: RateLimitConfig{
			RequestsPerSecond: getEnvAsFloat("RATE_LIMIT_REQUESTS_PER_SECOND", 10.0),
			Burst:             getEnvAsInt("RATE_LIMIT_BURST", 20),
		},
		Env: getEnv("ENV", "development"),
	}

	// Validate critical configuration
	if config.Database.URL == "" {
		return nil, fmt.Errorf("DATABASE_URL must be set")
	}
	if config.Auth.Username == "" || config.Auth.Password == "" {
		return nil, fmt.Errorf("AUTH_USERNAME and AUTH_PASSWORD must be set")
	}

	return config, nil
}

// Helper functions for environment variable parsing

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return defaultValue
	}
	return value
}

func getEnvAsFloat(key string, defaultValue float64) float64 {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.ParseFloat(valueStr, 64)
	if err != nil {
		return defaultValue
	}
	return value
}

func getEnvAsDuration(key string, defaultValue time.Duration) time.Duration {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	value, err := time.ParseDuration(valueStr)
	if err != nil {
		return defaultValue
	}
	return value
}
