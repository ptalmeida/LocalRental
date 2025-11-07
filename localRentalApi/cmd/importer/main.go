package main

import (
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

// GeoJSON structure
type GeoJSONCollection struct {
	Type     string    `json:"type"`
	Name     string    `json:"name"`
	Features []Feature `json:"features"`
}

type Feature struct {
	Type       string     `json:"type"`
	Properties Properties `json:"properties"`
	Geometry   Geometry   `json:"geometry"`
}

type Properties struct {
	OBJECTID            int    `json:"OBJECTID"`
	NrRNAL              int    `json:"NrRNAL"`
	Denominacao         string `json:"Denominacao"`
	DataRegisto         string `json:"DataRegisto"`
	DataAberturaPublico string `json:"DataAberturaPublico"`
	Modalidade          string `json:"Modalidade"`
	NrUtentes           int    `json:"NrUtentes"`
	Email               string `json:"Email"`
	Endereco            string `json:"Endereco"`
	CodigoPostal        string `json:"CodigoPostal"`
	LOCALIDADE          string `json:"LOCALIDADE"`
	LatLong             string `json:"LatLong"`
	FiabilidadeGeo      string `json:"FiabilidadeGeo"`
	Freguesia           string `json:"Freguesia"`
	Concelho            string `json:"Concelho"`
	Distrito            string `json:"Distrito"`
	NUTSIII             string `json:"NUTSIII"`
	NUTSII              string `json:"NUTSII"`
	ERT                 string `json:"ERT"`
	SeloCleanSafe       string `json:"SeloCleanSafe"`
}

type Geometry struct {
	Type        string    `json:"type"`
	Coordinates []float64 `json:"coordinates"` // [longitude, latitude]
}

func main() {
	// Parse command-line flags
	inputFile := flag.String("input", "aa.geojson", "Input GeoJSON file path")
	dbConn := flag.String("db", "postgres://localhost/alojamentos?sslmode=disable", "PostgreSQL connection string")
	batchSize := flag.Int("batch", 5000, "Batch size for insertions")
	flag.Parse()

	log.Printf("Starting import from %s to PostgreSQL", *inputFile)

	// Initialize database
	db, err := initDatabase(*dbConn)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Read and parse JSON file
	log.Println("Reading JSON file...")
	data, err := os.ReadFile(*inputFile)
	if err != nil {
		log.Fatalf("Failed to read file: %v", err)
	}

	log.Println("Parsing JSON...")
	var collection GeoJSONCollection
	if err := json.Unmarshal(data, &collection); err != nil {
		log.Fatalf("Failed to parse JSON: %v", err)
	}

	log.Printf("Found %d accommodations to import", len(collection.Features))

	// Import data in batches
	if err := importData(db, collection.Features, *batchSize); err != nil {
		log.Fatalf("Failed to import data: %v", err)
	}

	log.Println("Import completed successfully!")
	log.Println("\nNext steps:")
	log.Println("  - Run queries: ./query -db \"your-connection-string\"")
	log.Println("  - Use psql: psql -d alojamentos")
}

func initDatabase(connStr string) (*sql.DB, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Connected to PostgreSQL")

	// Create table schema
	schema := `
	CREATE TABLE IF NOT EXISTS alojamentos (
		id SERIAL PRIMARY KEY,
		object_id INTEGER,
		nr_rnal INTEGER UNIQUE,
		denominacao TEXT,
		data_registo TIMESTAMP,
		data_abertura_publico TIMESTAMP,
		modalidade TEXT,
		nr_utentes INTEGER,
		email TEXT,
		endereco TEXT,
		codigo_postal TEXT,
		localidade TEXT,
		latitude DOUBLE PRECISION,
		longitude DOUBLE PRECISION,
		fiabilidade_geo TEXT,
		freguesia TEXT,
		concelho TEXT,
		distrito TEXT,
		nuts_iii TEXT,
		nuts_ii TEXT,
		ert TEXT,
		selo_clean_safe TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_nr_rnal ON alojamentos(nr_rnal);
	CREATE INDEX IF NOT EXISTS idx_concelho ON alojamentos(concelho);
	CREATE INDEX IF NOT EXISTS idx_distrito ON alojamentos(distrito);
	CREATE INDEX IF NOT EXISTS idx_modalidade ON alojamentos(modalidade);
	CREATE INDEX IF NOT EXISTS idx_location ON alojamentos(latitude, longitude);
	`

	if _, err := db.Exec(schema); err != nil {
		return nil, fmt.Errorf("failed to create schema: %w", err)
	}

	log.Println("Database schema ready")
	return db, nil
}

func importData(db *sql.DB, features []Feature, batchSize int) error {
	start := time.Now()
	total := len(features)
	imported := 0
	skipped := 0

	// Prepare statement
	stmt, err := db.Prepare(`
		INSERT INTO alojamentos (
			object_id, nr_rnal, denominacao, data_registo, data_abertura_publico,
			modalidade, nr_utentes, email, endereco, codigo_postal, localidade,
			latitude, longitude, fiabilidade_geo, freguesia, concelho, distrito,
			nuts_iii, nuts_ii, ert, selo_clean_safe
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
		ON CONFLICT (nr_rnal) DO NOTHING
	`)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	// Begin transaction
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	txStmt := tx.Stmt(stmt)
	defer txStmt.Close()

	for i, feature := range features {
		// Parse coordinates
		var lat, lng float64
		if len(feature.Geometry.Coordinates) == 2 {
			lng = feature.Geometry.Coordinates[0]
			lat = feature.Geometry.Coordinates[1]
		}

		// Parse dates
		dataRegisto := parseDate(feature.Properties.DataRegisto)
		dataAbertura := parseDate(feature.Properties.DataAberturaPublico)

		// Execute insert
		result, err := txStmt.Exec(
			feature.Properties.OBJECTID,
			feature.Properties.NrRNAL,
			feature.Properties.Denominacao,
			dataRegisto,
			dataAbertura,
			feature.Properties.Modalidade,
			feature.Properties.NrUtentes,
			feature.Properties.Email,
			feature.Properties.Endereco,
			feature.Properties.CodigoPostal,
			feature.Properties.LOCALIDADE,
			lat,
			lng,
			feature.Properties.FiabilidadeGeo,
			feature.Properties.Freguesia,
			feature.Properties.Concelho,
			feature.Properties.Distrito,
			feature.Properties.NUTSIII,
			feature.Properties.NUTSII,
			feature.Properties.ERT,
			feature.Properties.SeloCleanSafe,
		)

		if err != nil {
			if strings.Contains(err.Error(), "duplicate key") {
				skipped++
			} else {
				log.Printf("Warning: Failed to insert record %d: %v", i, err)
			}
		} else {
			rowsAffected, _ := result.RowsAffected()
			if rowsAffected > 0 {
				imported++
			} else {
				skipped++
			}
		}

		// Commit batch
		if (i+1)%batchSize == 0 {
			if err := tx.Commit(); err != nil {
				return fmt.Errorf("failed to commit batch: %w", err)
			}

			progress := float64(i+1) / float64(total) * 100
			elapsed := time.Since(start)
			rate := float64(i+1) / elapsed.Seconds()

			log.Printf("Progress: %d/%d (%.1f%%) - %.0f records/sec - Imported: %d, Skipped: %d",
				i+1, total, progress, rate, imported, skipped)

			// Start new transaction
			tx, err = db.Begin()
			if err != nil {
				return fmt.Errorf("failed to begin new transaction: %w", err)
			}
			txStmt = tx.Stmt(stmt)
		}
	}

	// Commit remaining records
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit final batch: %w", err)
	}

	elapsed := time.Since(start)
	log.Printf("\nImport summary:")
	log.Printf("  Imported: %d", imported)
	log.Printf("  Skipped (duplicates): %d", skipped)
	log.Printf("  Total: %d", total)
	log.Printf("  Duration: %s", elapsed)
	log.Printf("  Rate: %.0f records/sec", float64(total)/elapsed.Seconds())

	return nil
}

func parseDate(dateStr string) *time.Time {
	if dateStr == "" {
		return nil
	}

	// Try parsing ISO8601 format
	formats := []string{
		time.RFC3339,
		"2006-01-02T15:04:05Z",
		"2006-01-02",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return &t
		}
	}

	return nil
}
