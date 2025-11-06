package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"pedroAPI/middleware"
	"pedroAPI/models"
	"pedroAPI/pkg/database"
	pkgValidator "pedroAPI/pkg/validator"
)

// GetAlojamentos godoc
// @Summary      List accommodations with pagination
// @Description  Get a paginated list of Portuguese accommodations
// @Tags         alojamentos
// @Accept       json
// @Produce      json
// @Param        page   query  int     false  "Page number (default: 1)"
// @Param        limit  query  int     false  "Items per page (default: 20, max: 100)"
// @Param        sort   query  string  false  "Sort field (id, nr_rnal, denominacao, concelho, distrito, created_at)"
// @Param        order  query  string  false  "Sort order (asc, desc)"
// @Success      200  {object}  models.PaginatedResponse[models.AlojamentoResponse]
// @Failure      400  {object}  models.ErrorResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /alojamentos [get]
func GetAlojamentos(w http.ResponseWriter, r *http.Request) {
	db, ok := middleware.GetDB(r)
	if !ok {
		RespondWithError(w, http.StatusInternalServerError, "Database connection not available")
		return
	}

	// Parse and validate query parameters
	params := models.AlojamentosQueryParams{
		Page:  1,
		Limit: 20,
		Sort:  "id",
		Order: "asc",
	}

	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		if page, err := strconv.Atoi(pageStr); err == nil {
			params.Page = page
		}
	}

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil {
			params.Limit = limit
		}
	}

	if sort := r.URL.Query().Get("sort"); sort != "" {
		params.Sort = sort
	}

	if order := r.URL.Query().Get("order"); order != "" {
		params.Order = order
	}

	// Validate params
	if err := pkgValidator.Validate(params); err != nil {
		details := pkgValidator.FormatValidationError(err)
		RespondWithValidationError(w, "Invalid query parameters", details)
		return
	}

	// Cap limit at 100
	if params.Limit > 100 {
		params.Limit = 100
	}

	// Get total count
	var total int
	countQuery := "SELECT COUNT(*) FROM alojamentos"
	if err := db.QueryRow(countQuery).Scan(&total); err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to count records")
		return
	}

	// Calculate offset
	offset := (params.Page - 1) * params.Limit

	// Build query
	query := fmt.Sprintf(`
		SELECT id, object_id, nr_rnal, denominacao, data_registo, data_abertura_publico,
		       modalidade, nr_utentes, email, endereco, codigo_postal, localidade,
		       latitude, longitude, fiabilidade_geo, freguesia, concelho, distrito,
		       nuts_iii, nuts_ii, ert, selo_clean_safe, created_at
		FROM alojamentos
		ORDER BY %s %s
		LIMIT $1 OFFSET $2
	`, params.Sort, params.Order)

	rows, err := db.Query(query, params.Limit, offset)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch records")
		return
	}
	defer rows.Close()

	// Scan results
	var alojamentos []models.AlojamentoResponse
	for rows.Next() {
		var a database.Alojamento
		if err := a.Scan(rows); err != nil {
			RespondWithError(w, http.StatusInternalServerError, "Failed to scan record")
			return
		}
		alojamentos = append(alojamentos, convertToResponse(a))
	}

	// Check for errors from iteration
	if err := rows.Err(); err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Error reading records")
		return
	}

	// Build response
	response := models.PaginatedResponse[models.AlojamentoResponse]{
		Data: alojamentos,
		Pagination: models.PaginationMeta{
			Total:   total,
			Page:    params.Page,
			Limit:   params.Limit,
			HasMore: offset+params.Limit < total,
		},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

// GetAlojamentoByID godoc
// @Summary      Get accommodation by ID
// @Description  Get a single accommodation by its ID
// @Tags         alojamentos
// @Accept       json
// @Produce      json
// @Param        id   path  int  true  "Accommodation ID"
// @Success      200  {object}  models.AlojamentoResponse
// @Failure      400  {object}  models.ErrorResponse
// @Failure      404  {object}  models.ErrorResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /alojamentos/{id} [get]
func GetAlojamentoByID(w http.ResponseWriter, r *http.Request) {
	db, ok := middleware.GetDB(r)
	if !ok {
		RespondWithError(w, http.StatusInternalServerError, "Database connection not available")
		return
	}

	// Extract ID from path
	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(pathParts) < 2 {
		RespondWithError(w, http.StatusBadRequest, "Missing ID parameter")
		return
	}

	idStr := pathParts[len(pathParts)-1]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid ID parameter")
		return
	}

	// Query by ID
	query := `
		SELECT id, object_id, nr_rnal, denominacao, data_registo, data_abertura_publico,
		       modalidade, nr_utentes, email, endereco, codigo_postal, localidade,
		       latitude, longitude, fiabilidade_geo, freguesia, concelho, distrito,
		       nuts_iii, nuts_ii, ert, selo_clean_safe, created_at
		FROM alojamentos
		WHERE id = $1
	`

	var a database.Alojamento
	if err := a.ScanRow(db.QueryRow(query, id)); err != nil {
		if err == sql.ErrNoRows {
			RespondWithError(w, http.StatusNotFound, "Accommodation not found")
			return
		}
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch record")
		return
	}

	RespondWithJSON(w, http.StatusOK, convertToResponse(a))
}

// SearchAlojamentos godoc
// @Summary      Search accommodations with filters
// @Description  Search accommodations with various filters and pagination
// @Tags         alojamentos
// @Accept       json
// @Produce      json
// @Param        page          query  int      false  "Page number (default: 1)"
// @Param        limit         query  int      false  "Items per page (default: 20, max: 100)"
// @Param        sort          query  string   false  "Sort field (id, nr_rnal, denominacao, concelho, distrito, created_at)"
// @Param        order         query  string   false  "Sort order (asc, desc)"
// @Param        concelho      query  string   false  "Filter by municipality"
// @Param        distrito      query  string   false  "Filter by district"
// @Param        modalidade    query  string   false  "Filter by accommodation type"
// @Param        email         query  string   false  "Filter by owner email"
// @Param        min_capacity  query  int      false  "Minimum capacity"
// @Param        max_capacity  query  int      false  "Maximum capacity"
// @Param        min_lat       query  number   false  "Minimum latitude"
// @Param        max_lat       query  number   false  "Maximum latitude"
// @Param        min_lng       query  number   false  "Minimum longitude"
// @Param        max_lng       query  number   false  "Maximum longitude"
// @Success      200  {object}  models.PaginatedResponse[models.AlojamentoResponse]
// @Failure      400  {object}  models.ErrorResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /alojamentos/search [get]
func SearchAlojamentos(w http.ResponseWriter, r *http.Request) {
	db, ok := middleware.GetDB(r)
	if !ok {
		RespondWithError(w, http.StatusInternalServerError, "Database connection not available")
		return
	}

	// Parse and validate query parameters
	params := models.SearchParams{
		Page:  1,
		Limit: 20,
		Sort:  "id",
		Order: "asc",
	}

	q := r.URL.Query()

	if pageStr := q.Get("page"); pageStr != "" {
		if page, err := strconv.Atoi(pageStr); err == nil {
			params.Page = page
		}
	}

	if limitStr := q.Get("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil {
			params.Limit = limit
		}
	}

	if sort := q.Get("sort"); sort != "" {
		params.Sort = sort
	}

	if order := q.Get("order"); order != "" {
		params.Order = order
	}

	params.Concelho = q.Get("concelho")
	params.Distrito = q.Get("distrito")
	params.Modalidade = q.Get("modalidade")
	params.Email = q.Get("email")

	if minCapStr := q.Get("min_capacity"); minCapStr != "" {
		if minCap, err := strconv.Atoi(minCapStr); err == nil {
			params.MinCapacity = &minCap
		}
	}

	if maxCapStr := q.Get("max_capacity"); maxCapStr != "" {
		if maxCap, err := strconv.Atoi(maxCapStr); err == nil {
			params.MaxCapacity = &maxCap
		}
	}

	if minLatStr := q.Get("min_lat"); minLatStr != "" {
		if minLat, err := strconv.ParseFloat(minLatStr, 64); err == nil {
			params.MinLat = &minLat
		}
	}

	if maxLatStr := q.Get("max_lat"); maxLatStr != "" {
		if maxLat, err := strconv.ParseFloat(maxLatStr, 64); err == nil {
			params.MaxLat = &maxLat
		}
	}

	if minLngStr := q.Get("min_lng"); minLngStr != "" {
		if minLng, err := strconv.ParseFloat(minLngStr, 64); err == nil {
			params.MinLng = &minLng
		}
	}

	if maxLngStr := q.Get("max_lng"); maxLngStr != "" {
		if maxLng, err := strconv.ParseFloat(maxLngStr, 64); err == nil {
			params.MaxLng = &maxLng
		}
	}

	// Validate params
	if err := pkgValidator.Validate(params); err != nil {
		details := pkgValidator.FormatValidationError(err)
		RespondWithValidationError(w, "Invalid query parameters", details)
		return
	}

	// Cap limit at 100
	if params.Limit > 100 {
		params.Limit = 100
	}

	// Build WHERE clause
	whereClause, whereArgs := buildWhereClause(params)

	// Get total count with filters
	countQuery := "SELECT COUNT(*) FROM alojamentos" + whereClause
	var total int
	if err := db.QueryRow(countQuery, whereArgs...).Scan(&total); err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to count records")
		return
	}

	// Calculate offset
	offset := (params.Page - 1) * params.Limit

	// Build full query
	query := fmt.Sprintf(`
		SELECT id, object_id, nr_rnal, denominacao, data_registo, data_abertura_publico,
		       modalidade, nr_utentes, email, endereco, codigo_postal, localidade,
		       latitude, longitude, fiabilidade_geo, freguesia, concelho, distrito,
		       nuts_iii, nuts_ii, ert, selo_clean_safe, created_at
		FROM alojamentos
		%s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, params.Sort, params.Order, len(whereArgs)+1, len(whereArgs)+2)

	// Append limit and offset to args
	queryArgs := append(whereArgs, params.Limit, offset)

	rows, err := db.Query(query, queryArgs...)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch records")
		return
	}
	defer rows.Close()

	// Scan results
	var alojamentos []models.AlojamentoResponse
	for rows.Next() {
		var a database.Alojamento
		if err := a.Scan(rows); err != nil {
			RespondWithError(w, http.StatusInternalServerError, "Failed to scan record")
			return
		}
		alojamentos = append(alojamentos, convertToResponse(a))
	}

	// Check for errors from iteration
	if err := rows.Err(); err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Error reading records")
		return
	}

	// Build response
	response := models.PaginatedResponse[models.AlojamentoResponse]{
		Data: alojamentos,
		Pagination: models.PaginationMeta{
			Total:   total,
			Page:    params.Page,
			Limit:   params.Limit,
			HasMore: offset+params.Limit < total,
		},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

// GetAlojamentosStats godoc
// @Summary      Get accommodation statistics
// @Description  Get aggregated statistics about accommodations
// @Tags         alojamentos
// @Accept       json
// @Produce      json
// @Success      200  {object}  models.StatsResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /alojamentos/stats [get]
func GetAlojamentosStats(w http.ResponseWriter, r *http.Request) {
	db, ok := middleware.GetDB(r)
	if !ok {
		RespondWithError(w, http.StatusInternalServerError, "Database connection not available")
		return
	}

	var stats models.StatsResponse

	// Total count
	if err := db.QueryRow("SELECT COUNT(*) FROM alojamentos").Scan(&stats.TotalAccommodations); err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch total count")
		return
	}

	// Average capacity
	if err := db.QueryRow("SELECT COALESCE(AVG(nr_utentes), 0) FROM alojamentos WHERE nr_utentes IS NOT NULL").Scan(&stats.AverageCapacity); err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch average capacity")
		return
	}

	// By distrito (top 10)
	districtRows, err := db.Query(`
		SELECT distrito, COUNT(*) as count
		FROM alojamentos
		WHERE distrito != ''
		GROUP BY distrito
		ORDER BY count DESC
		LIMIT 10
	`)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch district stats")
		return
	}
	defer districtRows.Close()

	for districtRows.Next() {
		var ds models.DistrictStats
		if err := districtRows.Scan(&ds.Distrito, &ds.Count); err != nil {
			RespondWithError(w, http.StatusInternalServerError, "Failed to scan district stats")
			return
		}
		stats.ByDistrito = append(stats.ByDistrito, ds)
	}

	// By concelho (top 10)
	concelhoRows, err := db.Query(`
		SELECT concelho, COUNT(*) as count
		FROM alojamentos
		WHERE concelho != ''
		GROUP BY concelho
		ORDER BY count DESC
		LIMIT 10
	`)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch municipality stats")
		return
	}
	defer concelhoRows.Close()

	for concelhoRows.Next() {
		var ms models.MunicipalityStats
		if err := concelhoRows.Scan(&ms.Concelho, &ms.Count); err != nil {
			RespondWithError(w, http.StatusInternalServerError, "Failed to scan municipality stats")
			return
		}
		stats.ByConcelho = append(stats.ByConcelho, ms)
	}

	// By modalidade
	modalidadeRows, err := db.Query(`
		SELECT modalidade, COUNT(*) as count
		FROM alojamentos
		WHERE modalidade != ''
		GROUP BY modalidade
		ORDER BY count DESC
	`)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch type stats")
		return
	}
	defer modalidadeRows.Close()

	for modalidadeRows.Next() {
		var ts models.TypeStats
		if err := modalidadeRows.Scan(&ts.Modalidade, &ts.Count); err != nil {
			RespondWithError(w, http.StatusInternalServerError, "Failed to scan type stats")
			return
		}
		stats.ByModalidade = append(stats.ByModalidade, ts)
	}

	RespondWithJSON(w, http.StatusOK, stats)
}

// Helper function to build WHERE clause from search params
func buildWhereClause(params models.SearchParams) (string, []interface{}) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	if params.Concelho != "" {
		conditions = append(conditions, fmt.Sprintf("concelho = $%d", argIndex))
		args = append(args, params.Concelho)
		argIndex++
	}

	if params.Distrito != "" {
		conditions = append(conditions, fmt.Sprintf("distrito = $%d", argIndex))
		args = append(args, params.Distrito)
		argIndex++
	}

	if params.Modalidade != "" {
		conditions = append(conditions, fmt.Sprintf("modalidade = $%d", argIndex))
		args = append(args, params.Modalidade)
		argIndex++
	}

	if params.Email != "" {
		conditions = append(conditions, fmt.Sprintf("email = $%d", argIndex))
		args = append(args, params.Email)
		argIndex++
	}

	if params.MinCapacity != nil {
		conditions = append(conditions, fmt.Sprintf("nr_utentes >= $%d", argIndex))
		args = append(args, *params.MinCapacity)
		argIndex++
	}

	if params.MaxCapacity != nil {
		conditions = append(conditions, fmt.Sprintf("nr_utentes <= $%d", argIndex))
		args = append(args, *params.MaxCapacity)
		argIndex++
	}

	if params.MinLat != nil {
		conditions = append(conditions, fmt.Sprintf("latitude >= $%d", argIndex))
		args = append(args, *params.MinLat)
		argIndex++
	}

	if params.MaxLat != nil {
		conditions = append(conditions, fmt.Sprintf("latitude <= $%d", argIndex))
		args = append(args, *params.MaxLat)
		argIndex++
	}

	if params.MinLng != nil {
		conditions = append(conditions, fmt.Sprintf("longitude >= $%d", argIndex))
		args = append(args, *params.MinLng)
		argIndex++
	}

	if params.MaxLng != nil {
		conditions = append(conditions, fmt.Sprintf("longitude <= $%d", argIndex))
		args = append(args, *params.MaxLng)
		argIndex++
	}

	if len(conditions) == 0 {
		return "", args
	}

	return " WHERE " + strings.Join(conditions, " AND "), args
}

// Helper function to convert database model to API response
func convertToResponse(a database.Alojamento) models.AlojamentoResponse {
	response := models.AlojamentoResponse{
		ID:        a.ID,
		CreatedAt: a.CreatedAt,
	}

	if a.NrRNAL.Valid {
		val := int(a.NrRNAL.Int64)
		response.NrRNAL = &val
	}

	if a.Denominacao.Valid {
		response.Denominacao = a.Denominacao.String
	}

	if a.DataRegisto.Valid {
		response.DataRegisto = &a.DataRegisto.Time
	}

	if a.DataAberturaPublico.Valid {
		response.DataAberturaPublico = &a.DataAberturaPublico.Time
	}

	if a.Modalidade.Valid {
		response.Modalidade = a.Modalidade.String
	}

	if a.NrUtentes.Valid {
		val := int(a.NrUtentes.Int64)
		response.NrUtentes = &val
	}

	if a.Email.Valid {
		response.Email = a.Email.String
	}

	if a.Endereco.Valid {
		response.Endereco = a.Endereco.String
	}

	if a.CodigoPostal.Valid {
		response.CodigoPostal = a.CodigoPostal.String
	}

	if a.Localidade.Valid {
		response.Localidade = a.Localidade.String
	}

	if a.Latitude.Valid {
		response.Latitude = &a.Latitude.Float64
	}

	if a.Longitude.Valid {
		response.Longitude = &a.Longitude.Float64
	}

	if a.Freguesia.Valid {
		response.Freguesia = a.Freguesia.String
	}

	if a.Concelho.Valid {
		response.Concelho = a.Concelho.String
	}

	if a.Distrito.Valid {
		response.Distrito = a.Distrito.String
	}

	return response
}
