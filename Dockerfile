# === Stage 1: Build CRM Frontend ===
FROM node:22-alpine AS crm-builder
WORKDIR /app
COPY crm/package.json crm/package-lock.json* ./
RUN npm ci
COPY crm/ .
RUN mkdir -p ../erpnext/www
RUN npm run build
RUN mkdir -p /tmp/crm && cp -r ../erpnext/public/crm/* /tmp/crm/
RUN mkdir -p /tmp/www && cp ../erpnext/www/crm.html /tmp/www/

# === Stage 2: ERPNext Backend ===
FROM python:3.14-slim

ENV DEBIAN_FRONTEND=noninteractive PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install --no-install-recommends -y \
    git curl mariadb-client libffi-dev libssl-dev build-essential libmariadb-dev pkg-config cron \
    && curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir frappe-bench

RUN useradd -ms /bin/bash frappe
USER frappe

RUN printf "[client]\nskip-ssl = true\n" > /home/frappe/.my.cnf

RUN bench init --frappe-branch develop --skip-redis-config-generation /home/frappe/frappe-bench

WORKDIR /home/frappe/frappe-bench

RUN yarn add onscan.js@^1.5.2

RUN printf "" > apps/frappe/frappe/templates/includes/footer/footer_powered.html

COPY --chown=frappe:frappe erpnext apps/erpnext/erpnext
COPY --chown=frappe:frappe pyproject.toml apps/erpnext/
COPY --chown=frappe:frappe README.md apps/erpnext/

RUN printf "" > apps/erpnext/erpnext/templates/includes/footer/footer_powered.html

RUN ./env/bin/pip install -e apps/erpnext && \
    printf "frappe\nerpnext\n" > sites/apps.txt && \
    ./env/bin/python -c "import erpnext; print('OK: erpnext module imported')" && \
    echo "=== apps.txt ===" && cat sites/apps.txt

COPY --chown=frappe:frappe --from=crm-builder /tmp/crm apps/erpnext/erpnext/public/crm
COPY --chown=frappe:frappe --from=crm-builder /tmp/www/crm.html apps/erpnext/erpnext/www/crm.html

RUN mkdir -p /home/frappe/frappe-bench/sites/assets && \
    ln -sf /home/frappe/frappe-bench/apps/erpnext/erpnext/public /home/frappe/frappe-bench/sites/assets/erpnext

COPY --chown=frappe:frappe <<'EOF' /entrypoint.sh
#!/bin/bash
set -e

cd /home/frappe/frappe-bench
mkdir -p /home/frappe/logs

: ${DB_HOST:=db}
: ${DB_PORT:=3306}
: ${REDIS_CACHE:=redis}
: ${REDIS_QUEUE:=redis}
: ${REDIS_SOCKETIO:=redis}
: ${SITE_NAME:=erpnext.local}

python3 -c "
import json
with open('sites/common_site_config.json', 'w') as f:
    json.dump({
        'background_workers': 1,
        'db_host': '$DB_HOST',
        'db_port': $DB_PORT,
        'redis_cache': 'redis://$REDIS_CACHE:6379',
        'redis_queue': 'redis://$REDIS_QUEUE:6379',
        'redis_socketio': 'redis://$REDIS_SOCKETIO:6379',
        'webserver_port': 8000,
        'serve_default_site': True,
        'gunicorn_workers': 33,
        'frappe_user': 'frappe',
    }, f, indent=2)
"

echo "Waiting for database..."
until mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" --silent; do sleep 2; done
echo "Database ready!"

SITE_DIR="sites/$SITE_NAME"
mkdir -p "$SITE_DIR/logs"
mkdir -p sites/assets
ln -sfn /home/frappe/frappe-bench/apps/frappe/frappe/public sites/assets/frappe
ln -sfn /home/frappe/frappe-bench/apps/erpnext/erpnext/public sites/assets/erpnext

if [ -f "$SITE_DIR/site_config.json" ]; then
    echo "Site $SITE_NAME already exists, setting it as default..."
    bench use "$SITE_NAME"
fi

if [ ! -f "$SITE_DIR/site_config.json" ]; then
    echo "Creating site $SITE_NAME..."
    bench new-site "$SITE_NAME" \
        --force \
        --mariadb-root-password "$DB_PASSWORD" \
        --admin-password "$ADMIN_PASSWORD" \
        --db-host "$DB_HOST" --db-port "$DB_PORT"
    echo "Installing erpnext app..."
    bench --site "$SITE_NAME" install-app erpnext
    bench use "$SITE_NAME"
fi

bench --site "$SITE_NAME" set-config app_name "Clothing ERP"
bench --site "$SITE_NAME" execute frappe.client.set_value --args '["Website Settings", "Website Settings", "app_name", "Clothing ERP"]'
bench build
bench --site "$SITE_NAME" clear-cache

exec bench start
EOF
RUN chmod +x /entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
