package database

import (
	"database/sql"
	"time"
)

// Alojamento represents an accommodation record from the database
type Alojamento struct {
	ID                   int            `json:"id"`
	ObjectID             sql.NullInt64  `json:"object_id,omitempty"`
	NrRNAL               sql.NullInt64  `json:"nr_rnal"`
	Denominacao          sql.NullString `json:"denominacao"`
	DataRegisto          sql.NullTime   `json:"data_registo,omitempty"`
	DataAberturaPublico  sql.NullTime   `json:"data_abertura_publico,omitempty"`
	Modalidade           sql.NullString `json:"modalidade"`
	NrUtentes            sql.NullInt64  `json:"nr_utentes"`
	Email                sql.NullString `json:"email,omitempty"`
	Endereco             sql.NullString `json:"endereco"`
	CodigoPostal         sql.NullString `json:"codigo_postal"`
	Localidade           sql.NullString `json:"localidade"`
	Latitude             sql.NullFloat64 `json:"latitude"`
	Longitude            sql.NullFloat64 `json:"longitude"`
	FiabilidadeGeo       sql.NullString `json:"fiabilidade_geo,omitempty"`
	Freguesia            sql.NullString `json:"freguesia"`
	Concelho             sql.NullString `json:"concelho"`
	Distrito             sql.NullString `json:"distrito"`
	NutsIII              sql.NullString `json:"nuts_iii,omitempty"`
	NutsII               sql.NullString `json:"nuts_ii,omitempty"`
	Ert                  sql.NullString `json:"ert,omitempty"`
	SeloCleanSafe        sql.NullString `json:"selo_clean_safe,omitempty"`
	CreatedAt            time.Time      `json:"created_at"`
}

// Scan scans a database row into an Alojamento struct
func (a *Alojamento) Scan(rows *sql.Rows) error {
	return rows.Scan(
		&a.ID,
		&a.ObjectID,
		&a.NrRNAL,
		&a.Denominacao,
		&a.DataRegisto,
		&a.DataAberturaPublico,
		&a.Modalidade,
		&a.NrUtentes,
		&a.Email,
		&a.Endereco,
		&a.CodigoPostal,
		&a.Localidade,
		&a.Latitude,
		&a.Longitude,
		&a.FiabilidadeGeo,
		&a.Freguesia,
		&a.Concelho,
		&a.Distrito,
		&a.NutsIII,
		&a.NutsII,
		&a.Ert,
		&a.SeloCleanSafe,
		&a.CreatedAt,
	)
}

// ScanRow scans a single database row into an Alojamento struct
func (a *Alojamento) ScanRow(row *sql.Row) error {
	return row.Scan(
		&a.ID,
		&a.ObjectID,
		&a.NrRNAL,
		&a.Denominacao,
		&a.DataRegisto,
		&a.DataAberturaPublico,
		&a.Modalidade,
		&a.NrUtentes,
		&a.Email,
		&a.Endereco,
		&a.CodigoPostal,
		&a.Localidade,
		&a.Latitude,
		&a.Longitude,
		&a.FiabilidadeGeo,
		&a.Freguesia,
		&a.Concelho,
		&a.Distrito,
		&a.NutsIII,
		&a.NutsII,
		&a.Ert,
		&a.SeloCleanSafe,
		&a.CreatedAt,
	)
}

// StatsByConcelho represents accommodation statistics by municipality
type StatsByConcelho struct {
	Concelho string `json:"concelho"`
	Count    int    `json:"count"`
}

// StatsByDistrito represents accommodation statistics by district
type StatsByDistrito struct {
	Distrito string `json:"distrito"`
	Count    int    `json:"count"`
}

// StatsByModalidade represents accommodation statistics by type
type StatsByModalidade struct {
	Modalidade string `json:"modalidade"`
	Count      int    `json:"count"`
}
