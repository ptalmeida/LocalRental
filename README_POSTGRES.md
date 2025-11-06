# Alojamentos Locais - PostgreSQL Importer

Import hundreds of thousands of Portuguese local accommodation (Alojamentos Locais) records from GeoJSON into PostgreSQL.

## ⚡ Quick Start

```bash
# 1. Create database
createdb alojamentos

# 2. Import data
./importer -input your_file.geojson

# 3. Query data
./query
```

**That's it!** Your data is now in PostgreSQL and ready to query.

## 📋 What You Get

- **Fast imports**: 5,000-15,000 records/second
- **Batch processing**: Efficient handling of large datasets
- **Progress tracking**: Real-time import statistics
- **Duplicate handling**: Automatic skipping of duplicates
- **Production ready**: Uses PostgreSQL for reliability and scale

## 🛠️ Setup

### Prerequisites

- Go 1.20+
- PostgreSQL 12+

### Install PostgreSQL

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu:**
```bash
sudo apt-get install postgresql
sudo systemctl start postgresql
```

### Build Tools

```bash
./setup_importer.sh
```

Creates:
- `importer` - JSON to PostgreSQL importer
- `query` - Example query tool

## 📊 Database Schema

All accommodation data is stored in a single `alojamentos` table:

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| nr_rnal | INTEGER | Registration number (unique) |
| denominacao | TEXT | Name |
| modalidade | TEXT | Type (Apartamento, Moradia, etc.) |
| concelho | TEXT | Municipality |
| distrito | TEXT | District |
| latitude | DOUBLE PRECISION | Latitude |
| longitude | DOUBLE PRECISION | Longitude |
| nr_utentes | INTEGER | Capacity |
| ... | ... | +13 more fields |

**Indexed fields:** nr_rnal, concelho, distrito, modalidade, (latitude, longitude)

## 🚀 Usage

### Basic Import

```bash
./importer -input example.geojson
```

### Custom Connection

```bash
./importer \
  -input data.geojson \
  -db "postgres://user:password@localhost/alojamentos?sslmode=disable"
```

### Large Datasets

```bash
./importer -input large_file.geojson -batch 10000
```

### Connection String Format

```
postgres://[user[:password]@][host][:port]/database[?options]
```

## 📈 Performance

| Records | Time | Speed |
|---------|------|-------|
| 10,000 | ~1s | 10,000/s |
| 100,000 | ~10s | 10,000/s |
| 500,000 | ~60s | 8,300/s |
| 1,000,000 | ~2min | 8,300/s |

*On SSD with default batch size of 5000*

## 💡 Example Queries

### Count by Type

```sql
SELECT modalidade, COUNT(*)
FROM alojamentos
GROUP BY modalidade
ORDER BY COUNT(*) DESC;
```

### Find in Lisboa

```sql
SELECT denominacao, endereco, latitude, longitude
FROM alojamentos
WHERE concelho = 'Lisboa'
LIMIT 10;
```

### Large Accommodations

```sql
SELECT denominacao, nr_utentes, concelho
FROM alojamentos
WHERE nr_utentes >= 10
ORDER BY nr_utentes DESC;
```

### Near a Location

```sql
SELECT denominacao, concelho
FROM alojamentos
WHERE latitude BETWEEN 38.7 AND 38.8
  AND longitude BETWEEN -9.2 AND -9.1;
```

## 🗺️ PostGIS Support

For advanced geospatial queries, enable PostGIS:

```sql
CREATE EXTENSION postgis;
ALTER TABLE alojamentos ADD COLUMN geom GEOMETRY(Point, 4326);
UPDATE alojamentos
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
CREATE INDEX idx_geom ON alojamentos USING GIST(geom);
```

Then query by distance:

```sql
-- Find within 5km of Lisboa center
SELECT denominacao, concelho
FROM alojamentos
WHERE ST_DWithin(
    geom::geography,
    ST_SetSRID(ST_MakePoint(-9.1393, 38.7223), 4326)::geography,
    5000  -- meters
);
```

## 📚 Documentation

- **POSTGRES_GUIDE.md** - Complete guide with advanced queries
- **setup_importer.sh** - Automated setup script

## 🐛 Troubleshooting

**Connection refused:**
```bash
# Check PostgreSQL is running
pg_isready

# Start if needed
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

**Database doesn't exist:**
```bash
createdb alojamentos
```

**Slow import:**
- Increase batch size: `-batch 20000`
- Use SSD storage
- Check available RAM

## 🔧 Command-Line Options

### Importer

```bash
./importer [options]

Options:
  -input string
        Input GeoJSON file path (default "example.geojson")
  -db string
        PostgreSQL connection string
        (default "postgres://localhost/alojamentos?sslmode=disable")
  -batch int
        Batch size for insertions (default 5000)
```

### Query Tool

```bash
./query [options]

Options:
  -db string
        PostgreSQL connection string
        (default "postgres://localhost/alojamentos?sslmode=disable")
```

## 📦 Data Format

Expects GeoJSON format with features containing:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "NrRNAL": 1,
        "Denominacao": "Example",
        "Concelho": "Lisboa",
        ...
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-9.1393, 38.7223]
      }
    }
  ]
}
```

## 🎯 Next Steps

1. **Query from API** - Add endpoints to your Go API
2. **Build Web UI** - Create search interface
3. **Visualize** - Show on map with Leaflet.js
4. **Analyze** - Export data for analysis
5. **Monitor** - Add logging and metrics

## 📄 License

MIT

---

**Questions?** See POSTGRES_GUIDE.md for detailed documentation.
