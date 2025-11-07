# Local Rental API

REST API for Portuguese accommodation rental data with 118,000+ properties.

## Quick Start

### Using Docker (Recommended)

From the project root:

```bash
# Start services
docker-compose up -d

# Import data
cd localRentalApi
DATABASE_URL="postgres://postgres:postgres@localhost:5432/alojamentos?sslmode=disable" \
  go run cmd/importer/main.go -input massive.geojson -batch 10000

# Access API
open http://localhost:8087/swagger/
```

### Local Development

```bash
# Install dependencies
go mod download

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run API
go run .

# Or build and run
go build -o localRental
./localRental
```

## API Endpoints

### Health
- `GET /health` - Basic health check
- `GET /ready` - Readiness check (includes database)

### Data
- `GET /alojamentos` - List properties (paginated)
- `GET /alojamentos/{id}` - Get property by ID
- `GET /alojamentos/search` - Search with filters
- `GET /alojamentos/stats` - Statistics by district/type

### Documentation
- `GET /swagger/` - Interactive API documentation

## Configuration

All configuration via environment variables (see `.env.example`):

- `PORT` - Server port (default: 8087)
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_USERNAME` / `AUTH_PASSWORD` - Basic auth credentials
- `RATE_LIMIT_REQUESTS_PER_SECOND` - Rate limit (default: 10)
- `RATE_LIMIT_BURST` - Burst size (default: 20)

## Project Structure

```
localRentalApi/
├── cmd/                    # Entry points
│   ├── root.go            # Main server
│   ├── importer/          # Data import tool
│   └── query/             # Query examples
├── handlers/              # HTTP handlers
├── middleware/            # HTTP middleware
├── models/                # Data models
├── pkg/
│   ├── config/           # Configuration management
│   ├── database/         # Database connection
│   └── validator/        # Input validation
└── docs/                 # Generated OpenAPI docs
```

## Tools

### Import Data

```bash
go run cmd/importer/main.go -input data.geojson -batch 10000
```

Options:
- `-input` - GeoJSON file path
- `-batch` - Batch size (default: 5000)
- `-db` - Database connection string

### Query Examples

```bash
go run cmd/query/main.go
```

## Development

```bash
# Run tests
go test ./...

# Build
go build

# Generate Swagger docs (after changes)
swag init

# Format code
go fmt ./...
```

## Docker

```bash
# Build image
docker build -t rental-api .

# Run container
docker run -p 8087:8087 \
  -e DATABASE_URL="your-db-url" \
  rental-api
```

## Features

- **Clean Architecture** - Organized packages, clear separation of concerns
- **Environment Configuration** - All settings via `.env` file
- **Rate Limiting** - Token bucket algorithm prevents abuse
- **Health Checks** - Ready for Kubernetes/cloud deployments
- **OpenAPI/Swagger** - Auto-generated API documentation
- **Validation** - Input validation with clear error messages
- **Connection Pooling** - Efficient database connections
- **Middleware** - Logging, auth, rate limiting, database injection

## Documentation

### Feature Guides
- [Validation](documentation/VALIDATION.md) - Input validation with go-playground/validator
- [Rate Limiting](documentation/RATELIMITING.md) - Token bucket rate limiting configuration
- [OpenAPI/Swagger](documentation/OPENAPI.md) - Auto-generated API documentation

### API Reference
- Interactive docs: http://localhost:8087/swagger/
- OpenAPI spec: `docs/swagger.json`

### Deployment
For cloud deployment guides, see [DEPLOYMENT.md](../DEPLOYMENT.md) in project root.
