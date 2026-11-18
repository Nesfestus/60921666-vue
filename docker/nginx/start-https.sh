#!/bin/sh
set -eu

if ! command -v certbot >/dev/null 2>&1; then
    apt-get update
    apt-get install -y --no-install-recommends certbot
fi

certbot certonly --standalone --non-interactive --agree-tos \
    --email "${CINEMA_CERTBOT_EMAIL:?Enter a Certbot email}" \
    --keep-until-expiring \
    --cert-name cinemavoid.space \
    -d cinemavoid.space -d www.cinemavoid.space

exec /docker-entrypoint.sh nginx -g 'daemon off;'
