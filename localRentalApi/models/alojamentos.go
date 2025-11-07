package models

import (
	"time"
)

// PaginationMeta contains pagination metadata
type PaginationMeta struct {
	Total   int  `json:"total"`
	Page    int  `json:"page"`
	Limit   int  `json:"limit"`
	HasMore bool `json:"has_more"`
}

// PaginatedResponse is a generic wrapper for paginated responses
type PaginatedResponse[T any] struct {
	Data       []T            `json:"data"`
	Pagination PaginationMeta `json:"pagination"`
}

// AlojamentosQueryParams represents query parameters for listing accommodations
type AlojamentosQueryParams struct {
	Page  int    `json:"page" validate:"omitempty,gte=1"`
	Limit int    `json:"limit" validate:"omitempty,gte=1,lte=100"`
	Sort  string `json:"sort" validate:"omitempty,oneof=id nr_rnal denominacao concelho distrito created_at"`
	Order string `json:"order" validate:"omitempty,oneof=asc desc"`
}

// SearchParams represents search filter parameters
type SearchParams struct {
	Page           int      `json:"page" validate:"omitempty,gte=1"`
	Limit          int      `json:"limit" validate:"omitempty,gte=1,lte=100"`
	Sort           string   `json:"sort" validate:"omitempty,oneof=id nr_rnal denominacao concelho distrito created_at"`
	Order          string   `json:"order" validate:"omitempty,oneof=asc desc"`
	Concelho       string   `json:"concelho" validate:"omitempty"`
	Distrito       string   `json:"distrito" validate:"omitempty"`
	Modalidade     string   `json:"modalidade" validate:"omitempty"`
	Email          string   `json:"email" validate:"omitempty"`
	MinCapacity    *int     `json:"min_capacity" validate:"omitempty,gte=0"`
	MaxCapacity    *int     `json:"max_capacity" validate:"omitempty,gte=0"`
	MinLat         *float64 `json:"min_lat" validate:"omitempty,latitude"`
	MaxLat         *float64 `json:"max_lat" validate:"omitempty,latitude"`
	MinLng         *float64 `json:"min_lng" validate:"omitempty,longitude"`
	MaxLng         *float64 `json:"max_lng" validate:"omitempty,longitude"`
}

// AlojamentoResponse represents an accommodation in API responses
type AlojamentoResponse struct {
	ID                  int        `json:"id"`
	NrRNAL              *int       `json:"nr_rnal,omitempty"`
	Denominacao         string     `json:"denominacao,omitempty"`
	DataRegisto         *time.Time `json:"data_registo,omitempty"`
	DataAberturaPublico *time.Time `json:"data_abertura_publico,omitempty"`
	Modalidade          string     `json:"modalidade,omitempty"`
	NrUtentes           *int       `json:"nr_utentes,omitempty"`
	Email               string     `json:"email,omitempty"`
	Endereco            string     `json:"endereco,omitempty"`
	CodigoPostal        string     `json:"codigo_postal,omitempty"`
	Localidade          string     `json:"localidade,omitempty"`
	Latitude            *float64   `json:"latitude,omitempty"`
	Longitude           *float64   `json:"longitude,omitempty"`
	Freguesia           string     `json:"freguesia,omitempty"`
	Concelho            string     `json:"concelho,omitempty"`
	Distrito            string     `json:"distrito,omitempty"`
	CreatedAt           time.Time  `json:"created_at"`
}

// StatsResponse represents aggregated statistics
type StatsResponse struct {
	TotalAccommodations int                   `json:"total_accommodations"`
	AverageCapacity     float64               `json:"average_capacity"`
	ByDistrito          []DistrictStats       `json:"by_distrito"`
	ByConcelho          []MunicipalityStats   `json:"by_concelho"`
	ByModalidade        []TypeStats           `json:"by_modalidade"`
}

// DistrictStats represents statistics by district
type DistrictStats struct {
	Distrito string `json:"distrito"`
	Count    int    `json:"count"`
}

// MunicipalityStats represents statistics by municipality
type MunicipalityStats struct {
	Concelho string `json:"concelho"`
	Count    int    `json:"count"`
}

// TypeStats represents statistics by accommodation type
type TypeStats struct {
	Modalidade string `json:"modalidade"`
	Count      int    `json:"count"`
}
