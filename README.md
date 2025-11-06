# Pedro API - Portuguese Accommodations Data API

A production-ready REST API for Portuguese local accommodations (Alojamentos Locais) data, built with Go featuring PostgreSQL integration, pagination, schema validation, and OpenAPI documentation.

## Overview

This API provides access to over 118,000 Portuguese accommodation records with advanced filtering, search capabilities, and aggregated statistics.

## Features

- **RESTful API** - Paginated accommodations data with filtering and search
- **PostgreSQL Database** - Connection pooling and optimized queries
- **Schema Validation** - Request validation using go-playground/validator
- **OpenAPI/Swagger** - Full API documentation and interactive testing
- **Rate Limiting** - Token bucket algorithm to prevent API abuse (10 req/s, burst of 20)
- **Clean Architecture** - Organized packages following Go best practices
- **Middleware Support** - Database injection, logging, rate limiting, and custom headers
- **Pagination** - Built-in pagination with metadata (total, hasMore)
- **Security** - Prepared statements prevent SQL injection

## Prerequisites

- **Go 1.20+**
- **PostgreSQL 12+**
- Data file: GeoJSON file with accommodation records (e.g., `example.geojson`)

## Quick Start

### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Setup Database

```bash
# Create database
createdb alojamentos

# Build and run the importer
./setup_importer.sh

# Import your data (adjust path to your GeoJSON file)
./importer -input example.geojson
```

For detailed database setup instructions, see:
- **[README_POSTGRES.md](./README_POSTGRES.md)** - Quick PostgreSQL setup guide
- **[POSTGRES_GUIDE.md](./POSTGRES_GUIDE.md)** - Comprehensive PostgreSQL guide with PostGIS

### 3. Run the API

```bash
# Build the API
go build -o pedroAPI .

# Run the server
./pedroAPI

# Server starts on http://localhost:8087
```

**Optional: Custom database connection**
```bash
# Using environment variable
export DATABASE_URL="postgres://user:pass@localhost/alojamentos?sslmode=disable"
./pedroAPI
```

## API Documentation

### Swagger UI (Interactive)
Visit **http://localhost:8087/swagger/** for:
- Interactive API explorer
- Try out endpoints directly
- View schemas and validation rules
- Test all query parameters

### OpenAPI Spec
- JSON: http://localhost:8087/swagger/doc.json
- YAML: `docs/swagger.yaml`

## Available Endpoints

### 1. List Accommodations (Paginated)
```bash
# Basic usage (default: page=1, limit=20)
curl "http://localhost:8087/alojamentos"

# With pagination
curl "http://localhost:8087/alojamentos?page=1&limit=50"

# With sorting
curl "http://localhost:8087/alojamentos?page=1&limit=20&sort=concelho&order=asc"
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort field: id, nr_rnal, denominacao, concelho, distrito, created_at
- `order` - Sort order: asc, desc

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "nr_rnal": 1,
      "denominacao": "Figo",
      "modalidade": "Apartamento",
      "concelho": "Olhão",
      "distrito": "Faro",
      "latitude": 37.065741,
      "longitude": -7.827038,
      ...
    }
  ],
  "pagination": {
    "total": 118484,
    "page": 1,
    "limit": 20,
    "has_more": true
  }
}
```

### 2. Get Single Accommodation
```bash
# By ID
curl "http://localhost:8087/alojamentos/1"

# By nr_rnal
curl "http://localhost:8087/alojamentos/100"
```

### 3. Search Accommodations (Advanced)
```bash
# Search by municipality
curl "http://localhost:8087/alojamentos/search?concelho=Lisboa&limit=10"

# Search by district and type
curl "http://localhost:8087/alojamentos/search?distrito=Porto&modalidade=Apartamento"

# Search by capacity
curl "http://localhost:8087/alojamentos/search?min_capacity=10&max_capacity=20"

# Search by location bounds
curl "http://localhost:8087/alojamentos/search?min_lat=38.7&max_lat=38.8&min_lng=-9.2&max_lng=-9.1"
```

**Filter Parameters:**
- `concelho` - Municipality name
- `distrito` - District name
- `modalidade` - Accommodation type (Apartamento, Moradia, etc.)
- `min_capacity` / `max_capacity` - Capacity range
- `min_lat` / `max_lat` - Latitude bounds
- `min_lng` / `max_lng` - Longitude bounds

### 4. Get Statistics
```bash
curl "http://localhost:8087/alojamentos/stats"
```

**Response includes:**
- Total accommodations count
- Average capacity
- Top 10 districts by count
- Top 10 municipalities by count
- Count by accommodation type

## Project Structure

```
pedroAPI/
├── main.go                      # Entry point with API metadata
├── cmd/
│   └── root.go                  # Server setup, database init, routing
├── handlers/                    # HTTP request handlers
│   ├── alojamentos.go           # Alojamentos endpoints (4 endpoints)
│   ├── admin.go                 # Admin handler
│   └── response.go              # Response utilities
├── middleware/                  # HTTP middleware
│   ├── database.go              # Database context injection
│   ├── auth.go                  # Authentication
│   ├── headers.go               # Header manipulation
│   ├── logging.go               # Request logging
│   └── ratelimit.go             # Rate limiting
├── models/                      # Data structures
│   ├── alojamentos.go           # Alojamentos DTOs with validation
│   └── responses.go             # Error responses
├── pkg/
│   ├── database/                # Database layer
│   │   ├── db.go                # Connection pool management
│   │   └── models.go            # Database row models
│   └── validator/               # Validation utilities
│       └── validator.go
├── cmd/importer/                # Data import tools
│   └── main.go                  # PostgreSQL importer
├── cmd/query/                   # Query examples
│   └── main.go                  # Sample queries
├── docs/                        # Auto-generated OpenAPI spec
│   ├── docs.go
│   ├── swagger.json
│   └── swagger.yaml
├── README.md                    # This file
├── README_POSTGRES.md           # PostgreSQL quick start
├── POSTGRES_GUIDE.md            # Detailed PostgreSQL guide
├── ARCHITECTURE.md              # Architecture documentation
├── OPENAPI.md                   # OpenAPI/Swagger guide
└── RATELIMITING.md              # Rate limiting guide
```

## Database Schema

The `alojamentos` table contains:
- **id** - Primary key
- **nr_rnal** - Unique registration number
- **denominacao** - Name
- **modalidade** - Type (Apartamento, Moradia, etc.)
- **concelho** - Municipality
- **distrito** - District
- **latitude** / **longitude** - Location coordinates
- **nr_utentes** - Capacity
- **email**, **endereco**, **codigo_postal**, **localidade** - Contact/address info
- **data_registo**, **data_abertura_publico** - Registration dates
- And more...

**Indexes** on: `nr_rnal`, `concelho`, `distrito`, `modalidade`, `(latitude, longitude)`

See [POSTGRES_GUIDE.md](./POSTGRES_GUIDE.md) for the complete schema.

## Data Import

The project includes a high-performance importer:

```bash
# Import GeoJSON data
./importer -input your_data.geojson

# Custom database connection
./importer -input data.geojson -db "postgres://user:pass@host/db?sslmode=disable"

# Large datasets with custom batch size
./importer -input large_file.geojson -batch 10000
```

**Performance**: 5,000-15,000 records/second

See [README_POSTGRES.md](./README_POSTGRES.md) for detailed import instructions.

## Rate Limiting

The API is protected by rate limiting (10 req/s, burst of 20):

```bash
# Normal usage - works fine
curl "http://localhost:8087/alojamentos?page=1&limit=10"

# Excessive requests - returns 429
# (More than 20 requests instantly from same IP)
```

**Rate limit exceeded response:**
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

See [RATELIMITING.md](./RATELIMITING.md) for customization details.

## Regenerating API Documentation

After adding or modifying endpoints:

```bash
~/go/bin/swag init
go build -o pedroAPI .
```

This regenerates the OpenAPI spec in `docs/`.

## Development

### Install Dependencies
```bash
go mod download
```

### Build
```bash
go build -o pedroAPI .
```

### Run Tests
```bash
go test ./...
```

### Database Connection Configuration

The API supports configuration via:
1. **Default**: `postgres://localhost/alojamentos?sslmode=disable`
2. **Environment variable**: `DATABASE_URL`

Connection pool settings:
- Max open connections: 25
- Max idle connections: 5
- Connection max lifetime: 5 minutes

See `pkg/database/db.go` for customization.

## Architecture

This API follows Go best practices with:
- **Separation of concerns** - Handlers, middleware, models, database in separate packages
- **Request context pattern** - Database connection passed via middleware
- **Pagination pattern** - Offset-limit with metadata
- **Validation layer** - Centralized request validation
- **SQL injection prevention** - Parameterized queries
- **Connection pooling** - Efficient database resource management
- **Documentation as code** - OpenAPI spec generated from annotations

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Dependencies

- [lib/pq](https://github.com/lib/pq) - PostgreSQL driver
- [go-playground/validator](https://github.com/go-playground/validator) - Request validation
- [swaggo/swag](https://github.com/swaggo/swag) - OpenAPI spec generation
- [swaggo/http-swagger](https://github.com/swaggo/http-swagger) - Swagger UI
- [golang.org/x/time/rate](https://pkg.go.dev/golang.org/x/time/rate) - Rate limiting

## Example Queries

### Find accommodations in Lisboa
```bash
curl "http://localhost:8087/alojamentos/search?concelho=Lisboa&limit=5" | jq '.'
```

### Large accommodations (10+ people)
```bash
curl "http://localhost:8087/alojamentos/search?min_capacity=10&order=desc&sort=nr_utentes" | jq '.'
```

### Get statistics
```bash
curl "http://localhost:8087/alojamentos/stats" | jq '.by_distrito[:5]'
```

## Troubleshooting

### Database Connection Issues

**Error: "Failed to connect to database"**
```bash
# Check PostgreSQL is running
pg_isready

# Start PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

**Error: "Database 'alojamentos' does not exist"**
```bash
createdb alojamentos
```

### Import Issues

See the troubleshooting section in [POSTGRES_GUIDE.md](./POSTGRES_GUIDE.md).

## License

MIT License
