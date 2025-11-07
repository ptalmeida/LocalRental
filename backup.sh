#!/bin/bash

# Database Backup & Restore Script
# Usage:
#   ./backup.sh backup              - Create a new backup
#   ./backup.sh restore <file>      - Restore from a backup file
#   ./backup.sh list                - List all backups

set -e

# Configuration
BACKUP_DIR="./backups"
CONTAINER_NAME="rental-api-postgres"
DB_USER="postgres"
DB_NAME="alojamentos"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if container is running
check_container() {
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${RED}Error: Container '${CONTAINER_NAME}' is not running${NC}"
        echo "Start it with: docker-compose up -d"
        exit 1
    fi
}

# Backup function
backup_database() {
    echo -e "${YELLOW}Starting database backup...${NC}"

    check_container

    # Create backup directory if it doesn't exist
    mkdir -p "${BACKUP_DIR}"

    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql"

    # Create backup
    echo -e "Backing up database '${DB_NAME}' to ${BACKUP_FILE}..."
    docker exec "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" "${DB_NAME}" > "${BACKUP_FILE}"

    # Check if backup was successful
    if [ -f "${BACKUP_FILE}" ] && [ -s "${BACKUP_FILE}" ]; then
        BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
        echo -e "${GREEN}✓ Backup completed successfully!${NC}"
        echo -e "  File: ${BACKUP_FILE}"
        echo -e "  Size: ${BACKUP_SIZE}"

        # Count number of backups
        BACKUP_COUNT=$(find "${BACKUP_DIR}" -name "*.sql" -o -name "*.sql.gz" 2>/dev/null | wc -l | tr -d ' ')
        echo -e "  Total backups: ${BACKUP_COUNT}"

        # Optional: Compress the backup
        read -p "Compress backup? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            gzip "${BACKUP_FILE}"
            COMPRESSED_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
            echo -e "${GREEN}✓ Backup compressed to ${BACKUP_FILE}.gz (${COMPRESSED_SIZE})${NC}"
        fi
    else
        echo -e "${RED}✗ Backup failed!${NC}"
        exit 1
    fi
}

# Restore function
restore_database() {
    local BACKUP_FILE="$1"

    # Check if backup file was provided
    if [ -z "${BACKUP_FILE}" ]; then
        echo -e "${RED}Error: No backup file specified${NC}"
        echo -e "${YELLOW}Usage:${NC} $0 restore <backup-file>"
        echo
        list_backups
        exit 1
    fi

    # Check if backup file exists
    if [ ! -f "${BACKUP_FILE}" ]; then
        echo -e "${RED}Error: Backup file '${BACKUP_FILE}' not found${NC}"
        exit 1
    fi

    check_container

    # Check if it's a gzipped file
    if [[ "${BACKUP_FILE}" == *.gz ]]; then
        echo -e "${YELLOW}Decompressing backup...${NC}"
        gunzip -k "${BACKUP_FILE}"
        BACKUP_FILE="${BACKUP_FILE%.gz}"
    fi

    echo -e "${RED}⚠️  WARNING: This will drop all existing data and restore from backup!${NC}"
    read -p "Are you sure you want to continue? (yes/no) " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "Restore cancelled."
        exit 0
    fi

    echo -e "${YELLOW}Restoring database from ${BACKUP_FILE}...${NC}"

    # Drop and recreate database
    docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -c "DROP DATABASE IF EXISTS ${DB_NAME};"
    docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -c "CREATE DATABASE ${DB_NAME};"

    # Restore backup
    docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" < "${BACKUP_FILE}"

    echo -e "${GREEN}✓ Database restored successfully!${NC}"

    # Verify restoration
    echo -e "${YELLOW}Verifying restoration...${NC}"
    RECORD_COUNT=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM alojamentos;" | tr -d ' ')
    echo -e "${GREEN}✓ Found ${RECORD_COUNT} records in database${NC}"
}

# List backups function
list_backups() {
    echo -e "${BLUE}Available backups in ${BACKUP_DIR}:${NC}"
    echo
    if [ -d "${BACKUP_DIR}" ] && [ "$(find "${BACKUP_DIR}" -name "*.sql" -o -name "*.sql.gz" 2>/dev/null | wc -l)" -gt 0 ]; then
        find "${BACKUP_DIR}" -name "*.sql" -o -name "*.sql.gz" | while read -r file; do
            SIZE=$(du -h "$file" | cut -f1)
            DATE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$file" 2>/dev/null || stat -c "%y" "$file" 2>/dev/null | cut -d. -f1)
            echo -e "  ${GREEN}$(basename "$file")${NC}"
            echo -e "    Size: ${SIZE}, Modified: ${DATE}"
        done
    else
        echo "  No backups found"
    fi
    echo
}

# Show usage
show_usage() {
    echo -e "${BLUE}Database Backup & Restore Script${NC}"
    echo
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 backup                    - Create a new backup"
    echo "  $0 restore <backup-file>     - Restore from a backup file"
    echo "  $0 list                      - List all available backups"
    echo
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 backup"
    echo "  $0 restore backups/alojamentos_20251107_002028.sql"
    echo "  $0 restore backups/alojamentos_20251107_002028.sql.gz"
    echo "  $0 list"
}

# Main script logic
case "${1}" in
    backup)
        backup_database
        ;;
    restore)
        restore_database "${2}"
        ;;
    list)
        list_backups
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
