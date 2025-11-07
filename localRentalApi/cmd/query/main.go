package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	dbConn := flag.String("db", "postgres://localhost/alojamentos?sslmode=disable", "PostgreSQL connection string")
	flag.Parse()

	db, err := sql.Open("postgres", *dbConn)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("=== Alojamentos Locais Database Queries ===\n")

	totalCount(db)

	countByModalidade(db)

	countByDistrito(db)

	recentRegistrations(db)

	topConcelhos(db)

	topOwners(db)
}

func totalCount(db *sql.DB) {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM alojamentos").Scan(&count)
	if err != nil {
		log.Printf("Error: %v", err)
		return
	}
	fmt.Printf("Total accommodations: %d\n\n", count)
}

func countByModalidade(db *sql.DB) {
	fmt.Println("Count by Type (Modalidade):")
	fmt.Println("---------------------------")

	rows, err := db.Query(`
		SELECT modalidade, COUNT(*) as count
		FROM alojamentos
		GROUP BY modalidade
		ORDER BY count DESC
	`)
	if err != nil {
		log.Printf("Error: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var modalidade string
		var count int
		if err := rows.Scan(&modalidade, &count); err != nil {
			log.Printf("Error: %v", err)
			continue
		}
		fmt.Printf("  %-20s: %d\n", modalidade, count)
	}
	fmt.Println()
}

func countByDistrito(db *sql.DB) {
	fmt.Println("Top 10 Districts:")
	fmt.Println("-----------------")

	rows, err := db.Query(`
		SELECT distrito, COUNT(*) as count
		FROM alojamentos
		WHERE distrito != ''
		GROUP BY distrito
		ORDER BY count DESC
		LIMIT 10
	`)
	if err != nil {
		log.Printf("Error: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var distrito string
		var count int
		if err := rows.Scan(&distrito, &count); err != nil {
			log.Printf("Error: %v", err)
			continue
		}
		fmt.Printf("  %-20s: %d\n", distrito, count)
	}
	fmt.Println()
}

func recentRegistrations(db *sql.DB) {
	fmt.Println("Most Recent Registrations:")
	fmt.Println("--------------------------")

	rows, err := db.Query(`
		SELECT denominacao, modalidade, concelho, data_registo
		FROM alojamentos
		WHERE data_registo IS NOT NULL
		ORDER BY data_registo DESC
		LIMIT 5
	`)
	if err != nil {
		log.Printf("Error: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var denominacao, modalidade, concelho string
		var dataRegisto sql.NullTime
		if err := rows.Scan(&denominacao, &modalidade, &concelho, &dataRegisto); err != nil {
			log.Printf("Error: %v", err)
			continue
		}
		date := "N/A"
		if dataRegisto.Valid {
			date = dataRegisto.Time.Format("2006-01-02")
		}
		fmt.Printf("  %s (%s) - %s [%s]\n", denominacao, modalidade, concelho, date)
	}
	fmt.Println()
}

func topConcelhos(db *sql.DB) {
	fmt.Println("Top 10 Municipalities (Concelhos):")
	fmt.Println("----------------------------------")

	rows, err := db.Query(`
		SELECT concelho, distrito, COUNT(*) as count
		FROM alojamentos
		WHERE concelho != ''
		GROUP BY concelho, distrito
		ORDER BY count DESC
		LIMIT 10
	`)
	if err != nil {
		log.Printf("Error: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var concelho, distrito string
		var count int
		if err := rows.Scan(&concelho, &distrito, &count); err != nil {
			log.Printf("Error: %v", err)
			continue
		}
		fmt.Printf("  %-25s (%-15s): %d\n", concelho, distrito, count)
	}
	fmt.Println()
}

func topOwners(db *sql.DB) {
	fmt.Println("Top 10 Owners (email):")
	fmt.Println("----------------------------------")

	rows, err := db.Query(`
		SELECT email, COUNT(*) as count
		FROM alojamentos
		WHERE email != ''
		GROUP BY email
		ORDER BY count DESC
		LIMIT 10
	`)
	if err != nil {
		log.Printf("Error: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var email string
		var count int
		if err := rows.Scan(&email, &count); err != nil {
			log.Printf("Error: %v", err)
			continue
		}
		fmt.Printf("  %-25s: %d\n", email, count)
	}
	fmt.Println()
}
