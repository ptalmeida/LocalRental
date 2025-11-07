# Validation

The API uses `go-playground/validator` for input validation.

## How It Works

Request models use struct tags for validation:

```go
type SearchRequest struct {
    Distrito   string `json:"distrito" validate:"omitempty,alpha"`
    Modalidade string `json:"modalidade" validate:"omitempty,oneof=Apartamento Moradia"`
    Limit      int    `json:"limit" validate:"omitempty,min=1,max=100"`
}
```

## Common Validation Tags

- `required` - Field must be present
- `email` - Valid email format
- `min=N` / `max=N` - String length or number range
- `gte=N` / `lte=N` - Greater/less than or equal
- `oneof=A B C` - Must be one of the listed values
- `alpha` - Alphabetic characters only
- `alphanum` - Alphanumeric characters only
- `omitempty` - Skip validation if field is empty

## Validation Response

Invalid requests return 400 with field-specific errors:

```json
{
  "error": "Validation failed",
  "details": {
    "email": "must be a valid email address",
    "age": "must be at least 18"
  }
}
```

## Implementation

See:
- `pkg/validator/validator.go` - Validation utility
- `models/` - Request/response models with validation tags
- `handlers/` - Handler implementations using validation

## Adding Validation to New Endpoints

1. Define request struct in `models/` with validation tags
2. Use `validator.Validate()` in your handler
3. Return validation errors with appropriate HTTP status

For examples, see existing handlers in `handlers/alojamentos.go`.

## References

- [go-playground/validator docs](https://github.com/go-playground/validator)
- Implementation: `pkg/validator/validator.go`
