# Rental API - Monorepo

A cloud-ready rental property management system with RESTful API and planned UI package.

## Project Structure

```
pedroAPI/
├── localRentalApi/          # Go REST API for rental property management
│   ├── cmd/                 # Application entry points
│   ├── handlers/            # HTTP request handlers
│   ├── middleware/          # HTTP middleware
│   ├── models/              # Data structures
│   ├── pkg/                 # Reusable packages
│   │   ├── config/          # Configuration management
│   │   ├── database/        # Database connection pool
│   │   └── validator/       # Validation utilities
│   ├── docs/                # OpenAPI/Swagger documentation
│   ├── .env.example         # Environment variables template
│   ├── Dockerfile           # Container build instructions
│   └── README.md            # API documentation
│
├── ui-package/              # Frontend UI (placeholder)
│   └── README.md
│
├── k8s/                     # Kubernetes manifests
│   ├── postgres-statefulset.yaml
│   ├── postgres-service.yaml
│   ├── api-deployment.yaml
│   ├── api-service.yaml
│   ├── api-configmap.yaml
│   ├── secrets.yaml.example
│   └── README.md
│
├── docker-compose.yml       # Local development orchestration
├── DEPLOYMENT.md            # Cloud deployment guide
└── README.md                # This file
```

## Features

### API (localRentalApi)
- RESTful API for rental property listings
- Geographic search capabilities
- Statistics and aggregations
- Rate limiting and authentication
- Health check endpoints
- OpenAPI/Swagger documentation
- PostgreSQL database with connection pooling
- Environment-based configuration
- Docker and Kubernetes ready

## Quick Start

### Prerequisites

- Go 1.23+
- PostgreSQL 16+ (or use Docker)
- Docker & Docker Compose (optional)

### Option 1: Local Development (with Docker Compose)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pedroAPI
   ```

2. **Start services**
   ```bash
   docker-compose up -d
   ```

3. **Import data** (first time only)
   ```bash
   cd localRentalApi
   DATABASE_URL="postgres://postgres:postgres@localhost:5432/alojamentos?sslmode=disable" \
     go run cmd/importer/main.go -file example.geojson
   ```

4. **Access the API**
   - API: http://localhost:8087
   - Swagger: http://localhost:8087/swagger/
   - Health: http://localhost:8087/health

### Option 2: Local Development (without Docker)

1. **Set up PostgreSQL**
   ```bash
   # Install and start PostgreSQL (macOS)
   brew install postgresql@16
   brew services start postgresql@16

   # Create database
   createdb alojamentos
   ```

2. **Configure environment**
   ```bash
   cd localRentalApi
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Install dependencies and run**
   ```bash
   go mod download
   go run . # or: go build && ./localRental
   ```

4. **Import data**
   ```bash
   go run cmd/importer/main.go -file example.geojson
   ```

### Option 3: Kubernetes Deployment

See [k8s/README.md](k8s/README.md) for detailed Kubernetes deployment instructions.

See [DEPLOYMENT.md](DEPLOYMENT.md) for cloud platform deployment guides.

## Configuration

All configuration is done via environment variables. See `localRentalApi/.env.example` for available options.

### Key Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8087` |
| `DATABASE_URL` | PostgreSQL connection string | See .env.example |
| `AUTH_USERNAME` | Basic auth username | `admin` |
| `AUTH_PASSWORD` | Basic auth password | `changeme123` |
| `RATE_LIMIT_REQUESTS_PER_SECOND` | Rate limit (req/s) | `10` |
| `RATE_LIMIT_BURST` | Rate limit burst size | `20` |

**IMPORTANT**: Change default passwords before deploying to production!

## API Endpoints

### Health Checks
- `GET /health` - Basic health check
- `GET /ready` - Readiness check (includes database)

### Rental Listings
- `GET /alojamentos` - List all properties (paginated)
- `GET /alojamentos/{id}` - Get property by ID
- `GET /alojamentos/search` - Search properties
- `GET /alojamentos/stats` - Get statistics

### Documentation
- `GET /swagger/` - Interactive API documentation

## Development

### Project Layout

The API follows clean architecture principles:
- `cmd/` - Application entry points (main, importer, query)
- `handlers/` - HTTP handlers (controllers)
- `middleware/` - HTTP middleware (auth, logging, rate limiting)
- `models/` - Data transfer objects
- `pkg/` - Reusable packages (database, config, validator)

### Building

```bash
# Build the API
cd localRentalApi
go build -o localRental

# Run tests
go test ./...

# Build Docker image
docker build -t rental-api:latest .
```

### Database

The project uses PostgreSQL with:
- Connection pooling
- Prepared statements
- Geographic queries (PostGIS not required)
- Automatic schema creation via importer

#### Database Backup & Restore

Use the included `backup.sh` script to manage database backups:

```bash
# Create a new backup
./backup.sh backup

# List all backups
./backup.sh list

# Restore from a backup
./backup.sh restore backups/alojamentos_20251107_002028.sql
```

Backups are stored in the `backups/` directory and are excluded from git. The script supports:
- Automatic timestamped backups
- Optional compression (gzip)
- Safe restore with confirmation prompts
- Backup verification

## Deployment

### Docker

```bash
# Build image
cd localRentalApi
docker build -t rental-api:latest .

# Run container
docker run -p 8087:8087 \
  -e DATABASE_URL="your-database-url" \
  -e AUTH_USERNAME="admin" \
  -e AUTH_PASSWORD="secure-password" \
  rental-api:latest
```

### Kubernetes

See [k8s/README.md](k8s/README.md) for Kubernetes deployment instructions.

### Cloud Platforms

See [DEPLOYMENT.md](DEPLOYMENT.md) for platform-specific guides:
- AWS (ECS + RDS)
- Google Cloud (Cloud Run + Cloud SQL)
- Azure (Container Apps + PostgreSQL)
- Heroku / Railway / Render

## Security Considerations

1. **Change default credentials** - Update `AUTH_USERNAME` and `AUTH_PASSWORD`
2. **Use secrets management** - Never commit `.env` files
3. **Enable SSL/TLS** - Use `sslmode=require` for PostgreSQL in production
4. **Rate limiting** - Configure appropriate rate limits for your use case
5. **Network policies** - Implement proper firewall rules and network segmentation

## Monitoring

### Health Checks

- `/health` - Returns 200 if the service is running
- `/ready` - Returns 200 if the service is ready (database connected)

### Logging

The API logs all requests to stdout in structured format:
```
time=2025-01-01T12:00:00Z level=INFO msg=request method=GET path=/alojamentos status=200 duration=15ms
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[Your License Here]

## Support

For issues and questions:
- Open an issue on GitHub
- Check the [API documentation](localRentalApi/README.md)
- Review [deployment guides](DEPLOYMENT.md)
