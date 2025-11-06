# PostgreSQL Import Guide - Alojamentos Locais

Complete guide to importing hundreds of thousands of Portuguese accommodation records into PostgreSQL.

## Quick Start (5 minutes)

```bash
# 1. Create database
createdb alojamentos

# 2. Run setup
./setup_importer.sh

# 3. Import data
./importer -input example.geojson

# 4. Query data
./query
```

Done! Your data is now in PostgreSQL.

## Detailed Setup

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

**Verify installation:**
```bash
psql --version
```

### 2. Create Database

```bash
# Create database
createdb alojamentos

# Or with specific user
createdb -U myuser alojamentos

# Connect to verify
psql alojamentos
```

### 3. Build Tools

```bash
./setup_importer.sh
```

This creates two binaries:
- `importer` - Imports JSON to PostgreSQL
- `query` - Runs example queries

## Import Your Data

### Basic Import

```bash
./importer -input your_file.geojson
```

Default connection: `postgres://localhost/alojamentos?sslmode=disable`

### Custom Connection String

```bash
./importer \
  -input data.geojson \
  -db "postgres://user:password@localhost:5432/alojamentos?sslmode=disable"
```

### Large Datasets

For hundreds of thousands of records:

```bash
./importer -input large_file.geojson -batch 10000
```

**Expected Performance:**
- Small (< 10k records): < 1 second
- Medium (10k-100k): 5-20 seconds
- Large (100k-500k): 30-120 seconds
- Very large (500k+): 2-5 minutes

**Import speed**: 5,000-15,000 records/second

### Progress Output

```
2025/11/04 23:24:37 Starting import from data.geojson to PostgreSQL
2025/11/04 23:24:37 Connected to PostgreSQL
2025/11/04 23:24:37 Database schema ready
2025/11/04 23:24:37 Reading JSON file...
2025/11/04 23:24:37 Parsing JSON...
2025/11/04 23:24:37 Found 250000 accommodations to import
Progress: 50000/250000 (20.0%) - 8521 records/sec - Imported: 49925, Skipped: 75
Progress: 100000/250000 (40.0%) - 8705 records/sec - Imported: 99850, Skipped: 150
...
Import summary:
  Imported: 249650
  Skipped (duplicates): 350
  Total: 250000
  Duration: 28.7s
  Rate: 8710 records/sec
```

## Database Schema

```sql
CREATE TABLE alojamentos (
    id SERIAL PRIMARY KEY,
    object_id INTEGER,
    nr_rnal INTEGER UNIQUE,              -- Unique registration number
    denominacao TEXT,                     -- Name
    data_registo TIMESTAMP,              -- Registration date
    data_abertura_publico TIMESTAMP,     -- Opening date
    modalidade TEXT,                      -- Type (Apartamento, Moradia, etc.)
    nr_utentes INTEGER,                   -- Capacity
    email TEXT,
    endereco TEXT,                        -- Address
    codigo_postal TEXT,                   -- Postal code
    localidade TEXT,                      -- Locality
    latitude DOUBLE PRECISION,            -- Extracted from geometry
    longitude DOUBLE PRECISION,           -- Extracted from geometry
    fiabilidade_geo TEXT,                -- Geo reliability
    freguesia TEXT,                       -- Parish
    concelho TEXT,                        -- Municipality
    distrito TEXT,                        -- District
    nuts_iii TEXT,                       -- NUTS III region
    nuts_ii TEXT,                        -- NUTS II region
    ert TEXT,                            -- Tourism region
    selo_clean_safe TEXT,                -- Clean & Safe seal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `nr_rnal` (unique)
- `concelho` (municipality)
- `distrito` (district)
- `modalidade` (type)
- `(latitude, longitude)` (location)

## Querying Data

### Using the Query Tool

```bash
./query

# With custom connection
./query -db "postgres://user:password@host/database?sslmode=disable"
```

### Using psql

```bash
psql alojamentos

-- Total count
SELECT COUNT(*) FROM alojamentos;

-- By type
SELECT modalidade, COUNT(*)
FROM alojamentos
GROUP BY modalidade
ORDER BY COUNT(*) DESC;

-- By district
SELECT distrito, COUNT(*)
FROM alojamentos
GROUP BY distrito
ORDER BY COUNT(*) DESC
LIMIT 10;
```

## Example Queries

### Find accommodations in Lisboa

```sql
SELECT denominacao, modalidade, endereco, latitude, longitude
FROM alojamentos
WHERE concelho = 'Lisboa'
LIMIT 20;
```

### Large accommodations (10+ people)

```sql
SELECT denominacao, nr_utentes, concelho, distrito
FROM alojamentos
WHERE nr_utentes >= 10
ORDER BY nr_utentes DESC;
```

### By registration year

```sql
SELECT
    EXTRACT(YEAR FROM data_registo) as year,
    COUNT(*) as count
FROM alojamentos
WHERE data_registo IS NOT NULL
GROUP BY year
ORDER BY year DESC;
```

### Near a location (within ~10km)

```sql
SELECT denominacao, concelho, latitude, longitude
FROM alojamentos
WHERE latitude BETWEEN 38.7 AND 38.8
  AND longitude BETWEEN -9.2 AND -9.1;
```

### Average capacity by type

```sql
SELECT
    modalidade,
    AVG(nr_utentes) as avg_capacity,
    COUNT(*) as count
FROM alojamentos
WHERE nr_utentes > 0
GROUP BY modalidade
ORDER BY avg_capacity DESC;
```

## Advanced: PostGIS for Geospatial Queries

For advanced location queries, enable PostGIS:

### Setup PostGIS

```sql
-- Connect to database
\c alojamentos

-- Enable extension
CREATE EXTENSION postgis;

-- Add geometry column
ALTER TABLE alojamentos
ADD COLUMN geom GEOMETRY(Point, 4326);

-- Populate from lat/lng
UPDATE alojamentos
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create spatial index
CREATE INDEX idx_geom ON alojamentos USING GIST(geom);
```

### PostGIS Queries

**Find within 5km of Lisboa center:**
```sql
SELECT denominacao, concelho,
       ST_Distance(geom::geography,
                  ST_SetSRID(ST_MakePoint(-9.1393, 38.7223), 4326)::geography) / 1000 as distance_km
FROM alojamentos
WHERE ST_DWithin(
    geom::geography,
    ST_SetSRID(ST_MakePoint(-9.1393, 38.7223), 4326)::geography,
    5000  -- 5km in meters
)
ORDER BY distance_km;
```

**Nearest accommodations to a point:**
```sql
SELECT denominacao, concelho,
       ST_Distance(geom::geography,
                  ST_SetSRID(ST_MakePoint(-9.1393, 38.7223), 4326)::geography) / 1000 as distance_km
FROM alojamentos
WHERE geom IS NOT NULL
ORDER BY geom <-> ST_SetSRID(ST_MakePoint(-9.1393, 38.7223), 4326)::geometry
LIMIT 10;
```

## Connection String Format

```
postgres://[user[:password]@][host][:port]/database[?options]
```

**Examples:**
```bash
# Local, no password
postgres://localhost/alojamentos?sslmode=disable

# With user
postgres://myuser@localhost/alojamentos?sslmode=disable

# With password
postgres://myuser:mypassword@localhost/alojamentos?sslmode=disable

# Remote server
postgres://myuser:mypassword@db.example.com:5432/alojamentos?sslmode=require

# Unix socket
postgres:///alojamentos?host=/var/run/postgresql
```

## Performance Tips

### Faster Imports

1. **Increase batch size:**
   ```bash
   ./importer -input data.json -batch 10000
   ```

2. **Disable autovacuum during import:**
   ```sql
   ALTER TABLE alojamentos SET (autovacuum_enabled = false);
   -- Run import
   ALTER TABLE alojamentos SET (autovacuum_enabled = true);
   VACUUM ANALYZE alojamentos;
   ```

3. **Drop indexes before import (for very large datasets):**
   ```sql
   -- Drop indexes
   DROP INDEX idx_concelho;
   DROP INDEX idx_distrito;
   -- Run import
   -- Recreate indexes
   CREATE INDEX idx_concelho ON alojamentos(concelho);
   CREATE INDEX idx_distrito ON alojamentos(distrito);
   ```

### Query Optimization

1. **Use EXPLAIN to analyze queries:**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM alojamentos WHERE concelho = 'Lisboa';
   ```

2. **Add indexes for common filters:**
   ```sql
   CREATE INDEX idx_custom ON alojamentos(your_column);
   ```

3. **Update statistics:**
   ```sql
   ANALYZE alojamentos;
   ```

## Troubleshooting

### Connection Refused

```
Error: failed to connect to database: dial tcp [::1]:5432: connect: connection refused
```

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL
# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql
```

### Authentication Failed

```
Error: pq: password authentication failed for user "myuser"
```

**Solution:**
- Check username/password in connection string
- Verify `pg_hba.conf` settings
- Create user if needed:
  ```sql
  CREATE USER myuser WITH PASSWORD 'mypassword';
  GRANT ALL PRIVILEGES ON DATABASE alojamentos TO myuser;
  ```

### Database Does Not Exist

```
Error: pq: database "alojamentos" does not exist
```

**Solution:**
```bash
createdb alojamentos
# Or with specific user:
createdb -U myuser alojamentos
```

### Out of Memory (Large Files)

If your JSON file is too large to parse at once, you'll need to:
1. Split the JSON file into smaller chunks
2. Import each chunk separately
3. Or implement streaming JSON parser (contact for help)

### Slow Import

**Check:**
- Batch size (increase to 10000 or 20000)
- Disk speed (SSD recommended)
- Available RAM
- Network if using remote database

## Export Data

### To CSV

```sql
\copy (SELECT * FROM alojamentos) TO 'alojamentos.csv' CSV HEADER;
```

### To JSON

```sql
\copy (SELECT row_to_json(alojamentos) FROM alojamentos) TO 'alojamentos.json';
```

### Specific Query Results

```sql
\copy (SELECT concelho, COUNT(*) FROM alojamentos GROUP BY concelho ORDER BY COUNT(*) DESC) TO 'by_concelho.csv' CSV HEADER;
```

## Next Steps

1. **Add API Endpoints** - Query from your Go API
2. **Create Web UI** - Build search interface
3. **Visualize on Map** - Use Leaflet.js + PostGIS
4. **Data Analysis** - Export and analyze with Python/R
5. **Real-time Updates** - Add triggers for notifications

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS Documentation](https://postgis.net/docs/)
- [pq Driver](https://github.com/lib/pq)
- [GeoJSON Specification](https://geojson.org/)
