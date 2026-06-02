#!/bin/bash
set -e

DOMAIN="clothing-jasur.duckdns.org"
EMAIL="${SSL_EMAIL:-admin@$DOMAIN}"

echo "=== Setting up SSL for $DOMAIN ==="

# Get initial cert
docker compose -f docker-compose.prod.yml run --rm certbot \
  certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

echo "=== SSL certificate obtained! ==="

# Reload nginx to pick up the cert
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "=== Done! ==="
echo ""
echo "To auto-renew SSL, the certbot container will check daily."
echo "Test renewal with:"
echo "  docker compose -f docker-compose.prod.yml run --rm certbot renew --dry-run"
