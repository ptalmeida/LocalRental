#!/bin/bash

# Setup script for Alojamentos Locais data importer (PostgreSQL)

echo "================================================"
echo "Alojamentos Locais Importer Setup (PostgreSQL)"
echo "================================================"
echo ""

# Step 1: Check PostgreSQL
echo "Step 1: Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "✓ PostgreSQL client found"
    psql --version
else
    echo "⚠ PostgreSQL client not found. Install with:"
    echo "  macOS:  brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    echo ""
fi
echo ""

# Step 2: Install dependencies
echo "Step 2: Installing Go dependencies..."
go get github.com/lib/pq
if [ $? -eq 0 ]; then
    echo "✓ PostgreSQL driver installed"
else
    echo "✗ Failed to install PostgreSQL driver"
    exit 1
fi
echo ""

# Step 3: Build importer
echo "Step 3: Building importer..."
go build -o importer ./cmd/importer
if [ $? -eq 0 ]; then
    echo "✓ Importer built successfully"
else
    echo "✗ Failed to build importer"
    exit 1
fi
echo ""

# Step 4: Build query tool
echo "Step 4: Building query tool..."
go build -o query ./cmd/query
if [ $? -eq 0 ]; then
    echo "✓ Query tool built successfully"
else
    echo "✗ Failed to build query tool"
    exit 1
fi
echo ""

echo "================================================"
echo "Setup complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "  1. Create database:"
echo "     createdb alojamentos"
echo ""
echo "  2. Import data:"
echo "     ./importer -input aa.geojson -db \"postgres://localhost/alojamentos?sslmode=disable\""
echo ""
echo "  3. Query data:"
echo "     ./query -db \"postgres://localhost/alojamentos?sslmode=disable\""
echo ""
echo "For more information, see POSTGRES_GUIDE.md"
