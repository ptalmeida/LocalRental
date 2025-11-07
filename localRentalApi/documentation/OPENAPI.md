# OpenAPI / Swagger Documentation

The API has full OpenAPI 3.0 specification with interactive Swagger UI.

## Accessing Documentation

### Swagger UI (Interactive)
Visit: **http://localhost:8087/swagger/**

Features:
- Interactive API explorer
- Try endpoints directly from browser
- View request/response schemas
- Test with different parameters

### OpenAPI Spec Files

Available formats:
- **JSON**: `docs/swagger.json`
- **YAML**: `docs/swagger.yaml`
- **Go Code**: `docs/docs.go` (auto-generated)

## Updating Documentation

The OpenAPI spec is generated from code annotations using `swag`.

### After changing endpoints:

```bash
# Install swag (first time only)
go install github.com/swaggo/swag/cmd/swag@latest

# Regenerate documentation
swag init
```

### Adding annotations to handlers:

```go
// GetAlojamentos returns a paginated list of accommodations
// @Summary List accommodations
// @Description Get paginated accommodations with optional filters
// @Tags accommodations
// @Accept json
// @Produce json
// @Param limit query int false "Items per page" default(10)
// @Param page query int false "Page number" default(1)
// @Success 200 {object} models.AlojamentosResponse
// @Failure 400 {object} models.ErrorResponse
// @Router /alojamentos [get]
func GetAlojamentos(w http.ResponseWriter, r *http.Request) {
    // ...
}
```

## Documentation Structure

- `@Summary` - Short description (shown in list)
- `@Description` - Detailed description
- `@Tags` - Groups endpoints
- `@Accept` / `@Produce` - Content types
- `@Param` - Query/path/body parameters
- `@Success` / `@Failure` - Response codes and types
- `@Router` - Endpoint path and method

## References

- [swag documentation](https://github.com/swaggo/swag)
- [OpenAPI specification](https://swagger.io/specification/)
- Current spec: `docs/swagger.json`
