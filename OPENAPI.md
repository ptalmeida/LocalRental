# OpenAPI / Swagger Documentation

Your API now has full OpenAPI 3.0 specification and interactive Swagger UI documentation!

## Accessing the Documentation

### Swagger UI (Interactive)
Visit: **http://localhost:8087/swagger/index.html**

This provides:
- Interactive API explorer
- Try out endpoints directly from the browser
- View request/response schemas
- See validation requirements
- Test authentication

### OpenAPI Spec Files

The specification is available in multiple formats:

1. **JSON**: `http://localhost:8087/swagger/doc.json`
2. **YAML**: Located at `docs/swagger.yaml`
3. **Go Code**: Generated at `docs/docs.go`

## What's Documented

### API Information
- **Title**: LocalRental
- **Version**: 1.0
- **Description**: A simple calculator API with validation
- **License**: MIT
- **Contact**: support@localrental.com

### Endpoints

#### Math Operations
- `POST /sum` - Add two numbers
- `POST /subtract` - Subtract two numbers
- `POST /multiply` - Multiply two numbers
- `POST /divide` - Divide two numbers

### Request/Response Models

All models are fully documented with:
- Field types (number, string, etc.)
- Required fields (from validation tags)
- Example values
- Descriptions

Example from `TwoPartCalculationRequest`:
```json
{
  "a": 10,
  "b": 5
}
```

Both fields are marked as **required** (from `validate:"required"` tags).

### Validation Documentation

The OpenAPI spec automatically includes validation rules from your Go struct tags:
- Required fields: `validate:"required"`
- Min/max values: `validate:"gte=18,lte=120"`
- String patterns: `validate:"email"`, `validate:"alphanum"`

## Adding Documentation to New Endpoints

When you add a new endpoint, document it with swagger annotations:

```go
// CreateUserHandler handles user creation
// @Summary      Create a new user
// @Description  Register a new user account
// @Tags         Users
// @Accept       json
// @Produce      json
// @Param        request body models.UserRequest true "User details"
// @Success      201 {object} models.UserResponse
// @Failure      400 {object} models.ErrorResponse
// @Router       /users [post]
func CreateUserHandler(w http.ResponseWriter, r *http.Request) {
    // handler code
}
```

### Annotation Reference

| Annotation | Purpose | Example |
|------------|---------|---------|
| `@Summary` | Short description | `@Summary Add two numbers` |
| `@Description` | Detailed description | `@Description Calculate sum...` |
| `@Tags` | Group endpoints | `@Tags Math Operations` |
| `@Accept` | Request content type | `@Accept json` |
| `@Produce` | Response content type | `@Produce json` |
| `@Param` | Request parameter | `@Param request body models.Request true "Description"` |
| `@Success` | Success response | `@Success 200 {object} models.Response` |
| `@Failure` | Error response | `@Failure 400 {object} models.ErrorResponse` |
| `@Router` | Route path and method | `@Router /users [post]` |
| `@Security` | Auth requirement | `@Security BasicAuth` |

## Regenerating Documentation

After making changes to your code or annotations:

```bash
~/go/bin/swag init
go build -o localRental
```

This will:
1. Parse your Go code
2. Extract swagger annotations
3. Generate OpenAPI spec files in `docs/`
4. Update `docs/docs.go` with embedded spec

## Integration with Other Tools

### Postman
Import the OpenAPI spec into Postman:
1. Download: `http://localhost:8087/swagger/doc.json`
2. Postman → Import → Upload file

### Code Generation
Generate client SDKs using:
- **OpenAPI Generator**: https://openapi-generator.tech/
- **Swagger Codegen**: https://github.com/swagger-api/swagger-codegen

Example:
```bash
# Generate TypeScript client
openapi-generator-cli generate \
  -i http://localhost:8087/swagger/doc.json \
  -g typescript-axios \
  -o ./client/typescript
```

### API Testing
Use the spec for automated testing:
- **Dredd**: API testing against spec
- **Schemathesis**: Property-based testing

## Best Practices

1. **Keep annotations updated** - Update docs when changing endpoints
2. **Describe error cases** - Document all possible error responses
3. **Use examples** - Add example values to models
4. **Group by tags** - Organize endpoints with consistent tags
5. **Document auth** - Always specify security requirements

## Example: Complete Endpoint Documentation

```go
// ProcessPaymentHandler handles payment processing
// @Summary      Process a payment
// @Description  Process a payment transaction with validation
// @Tags         Payments
// @Accept       json
// @Produce      json
// @Param        request body models.PaymentRequest true "Payment details"
// @Success      200 {object} models.PaymentResponse "Payment successful"
// @Failure      400 {object} models.ErrorResponse "Invalid request"
// @Failure      401 {object} models.ErrorResponse "Unauthorized"
// @Failure      402 {object} models.ErrorResponse "Payment required"
// @Failure      500 {object} models.ErrorResponse "Server error"
// @Security     BasicAuth
// @Router       /payments [post]
func ProcessPaymentHandler(w http.ResponseWriter, r *http.Request) {
    // implementation
}
```

## Viewing in Swagger UI

1. Start your API: `./localRental`
2. Open browser: http://localhost:8087/swagger/index.html
3. Try out endpoints with the "Try it out" button
4. View schemas, examples, and responses

The Swagger UI provides:
- **Schema visualization** - See all models and their fields
- **Interactive testing** - Execute requests from the browser
- **Authentication** - Test protected endpoints
- **Response validation** - See actual vs expected responses

## Files Generated

```
docs/
├── docs.go        # Go file with embedded OpenAPI spec
├── swagger.json   # OpenAPI spec in JSON format
└── swagger.yaml   # OpenAPI spec in YAML format
```

All files are auto-generated. **Do not edit manually** - they will be overwritten when you run `swag init`.
