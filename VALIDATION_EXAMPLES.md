# Schema Validation Examples

This guide shows how to add new endpoints with validation to your API.

## Project Structure

```
localRental/
├── models/              # Request/response structs with validation tags
│   ├── requests.go
│   └── responses.go
├── pkg/
│   └── validator/      # Validation utility
│       └── validator.go
└── cmd/
    └── root.go         # Handlers
```

## Adding a New Validated Endpoint

### 1. Define the Request Model

In `models/requests.go`:

```go
type UserRequest struct {
    Email    string `json:"email" validate:"required,email"`
    Age      int    `json:"age" validate:"required,gte=18,lte=120"`
    Username string `json:"username" validate:"required,min=3,max=50,alphanum"`
    Password string `json:"password" validate:"required,min=8"`
}
```

### 2. Create the Handler

In `cmd/root.go`:

```go
func createUserHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        respondWithError(w, http.StatusMethodNotAllowed, "Method not allowed")
        return
    }

    var req models.UserRequest

    // Decode JSON
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        respondWithError(w, http.StatusBadRequest, "Invalid JSON: "+err.Error())
        return
    }

    // Validate
    if err := validator.Validate(&req); err != nil {
        validationErrors := validator.FormatValidationError(err)
        respondWithValidationError(w, "Validation failed", validationErrors)
        return
    }

    // Your business logic here
    respondWithJSON(w, http.StatusCreated, map[string]string{
        "message": "User created successfully",
        "username": req.Username,
    })
}
```

### 3. Register the Route

In `Execute()` function:

```go
mux.HandleFunc("/users", createUserHandler)
```

## Common Validation Tags

| Tag | Description | Example |
|-----|-------------|---------|
| `required` | Field must be present and non-zero | `validate:"required"` |
| `email` | Valid email format | `validate:"email"` |
| `min` | Minimum length (string) or value (number) | `validate:"min=3"` |
| `max` | Maximum length (string) or value (number) | `validate:"max=50"` |
| `len` | Exact length | `validate:"len=8"` |
| `gte` | Greater than or equal to | `validate:"gte=18"` |
| `lte` | Less than or equal to | `validate:"lte=120"` |
| `gt` | Greater than | `validate:"gt=0"` |
| `lt` | Less than | `validate:"lt=100"` |
| `alphanum` | Only alphanumeric characters | `validate:"alphanum"` |
| `url` | Valid URL | `validate:"url"` |
| `oneof` | One of specified values | `validate:"oneof=active inactive"` |
| `omitempty` | Skip validation if empty | `validate:"omitempty,email"` |

## Multiple Validations

Combine multiple tags with commas:

```go
type Product struct {
    Name  string  `json:"name" validate:"required,min=1,max=100"`
    Price float64 `json:"price" validate:"required,gt=0"`
    SKU   string  `json:"sku" validate:"required,alphanum,len=8"`
}
```

## Testing Your Validation

### Valid Request
```bash
curl -X POST http://localhost:8087/add \
  -H "Content-Type: application/json" \
  -d '{"a": 5, "b": 10}'
```

Response:
```json
{
  "result": 15
}
```

### Missing Required Field
```bash
curl -X POST http://localhost:8087/add \
  -H "Content-Type: application/json" \
  -d '{"a": 5}'
```

Response:
```json
{
  "error": "Validation failed",
  "details": {
    "B": "B is required"
  }
}
```

### Invalid JSON
```bash
curl -X POST http://localhost:8087/add \
  -H "Content-Type: application/json" \
  -d 'invalid json'
```

Response:
```json
{
  "error": "Invalid JSON: invalid character 'i' looking for beginning of value"
}
```

## Advanced: Custom Validators

To add custom validation logic, modify `pkg/validator/validator.go`:

```go
func init() {
    validate = validator.New()

    // Register custom validator
    validate.RegisterValidation("customrule", customValidator)
}

func customValidator(fl validator.FieldLevel) bool {
    // Your custom validation logic
    return fl.Field().String() != "forbidden"
}
```

Then use it in your model:
```go
type MyRequest struct {
    Field string `json:"field" validate:"required,customrule"`
}
```
