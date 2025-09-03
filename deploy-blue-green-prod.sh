#!/bin/bash

set -e

# -------------------------------
# CONFIGURATION
# -------------------------------
IMAGE_TAG=${IMAGE_TAG:?IMAGE_TAG is not set. Aborting.}
APP_NAME="shop_bazar"
HEALTH_PORT=${HEALTH_PORT:-3004}
NGINX_TEMPLATE="./nginx/nginx.conf"
NGINX_CONF="/etc/nginx/sites-available/shop.conf"

# -------------------------------
# DETERMINE ACTIVE & INACTIVE
# -------------------------------
if docker compose -f docker-compose.production.yml -p $APP_NAME ps | grep -q "${APP_NAME}_blue"; then
    ACTIVE="${APP_NAME}_blue"
    INACTIVE="${APP_NAME}_green"
else
    ACTIVE="${APP_NAME}_green"
    INACTIVE="${APP_NAME}_blue"
fi

echo "🔁 Active: $ACTIVE"
echo "🚀 Deploying to: $INACTIVE with image tag: $IMAGE_TAG"

# -------------------------------
# START INACTIVE CONTAINER
# -------------------------------
docker compose -f docker-compose.production.yml -p $APP_NAME up -d --no-deps --force-recreate \
    --scale $INACTIVE=1 --build $INACTIVE

# -------------------------------
# WAIT (Instead of health check)
# -------------------------------
echo "⏳ Waiting 20s for $INACTIVE to boot..."
sleep 30

# Resolve container IP
CONTAINER_ID=$(docker compose -f docker-compose.production.yml -p $APP_NAME ps -q $INACTIVE)
CONTAINER_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$CONTAINER_ID")

if [ -z "$CONTAINER_IP" ]; then
    echo "❌ Could not resolve IP for $INACTIVE"
    exit 1
fi

# -------------------------------
# UPDATE NGINX
# -------------------------------
echo "Switching NGINX to $INACTIVE ($CONTAINER_IP)"
export ACTIVE_APP=$CONTAINER_IP
echo "ACTIVE_APP=$ACTIVE_APP"
chmod 644 ./nginx/nginx.template.conf

envsubst '${ACTIVE_APP}' < ./nginx/nginx.template.conf > template.conf
sudo mv template.conf /etc/nginx/sites-available/shop.conf
sudo ln -sf /etc/nginx/sites-available/shop.conf /etc/nginx/sites-enabled/shop.conf

sudo nginx -t
sudo systemctl reload nginx

# -------------------------------
# STOP & REMOVE OLD CONTAINER
# -------------------------------
echo "🛑 Stopping and removing old app $ACTIVE..."
docker compose -f docker-compose.production.yml -p $APP_NAME stop $ACTIVE
docker compose -f docker-compose.production.yml -p $APP_NAME rm -f $ACTIVE

echo "✅ Blue-Green Deployment Complete. Live: $INACTIVE"
