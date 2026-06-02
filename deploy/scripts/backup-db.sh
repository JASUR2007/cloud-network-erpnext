#!/bin/bash
set -e

BACKUP_DIR=${BACKUP_DIR:-/backups}
DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-3306}
DB_PASSWORD=${DB_PASSWORD:-erpnext}
S3_BUCKET=${S3_BUCKET:-""}
RETENTION_DAYS=${RETENTION_DAYS:-7}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="erpnext_backup_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

# Backup each database (skip system DBs)
databases=$(mysql -h"$DB_HOST" -P"$DB_PORT" -uroot -p"$DB_PASSWORD" -e "SHOW DATABASES;" 2>/dev/null \
  | grep -Ev "^(Database|information_schema|performance_schema|mysql|sys)$")

for db in $databases; do
    echo "  Backing up: $db"
    mysqldump -h"$DB_HOST" -P"$DB_PORT" -uroot -p"$DB_PASSWORD" \
      --single-transaction --routines --triggers --events "$db" 2>/dev/null \
      | gzip > "$BACKUP_DIR/${db}_$FILENAME"
done

echo "[$(date)] Backup completed: $BACKUP_DIR"

# Upload to S3 if configured
if [ -n "$S3_BUCKET" ]; then
    aws s3 sync "$BACKUP_DIR" "s3://$S3_BUCKET/backups/" --delete
    echo "[$(date)] Uploaded to S3: s3://$S3_BUCKET/backups/"
fi

# Cleanup old backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Cleaned up backups older than $RETENTION_DAYS days"
