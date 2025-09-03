#!/bin/bash

set -e

# -------------------------------
# CONFIGURATION
# -------------------------------
IMAGE_TAG=${IMAGE_TAG:?IMAGE_TAG is not set. Aborting.}
APP_NAME="shop_bazar"
HEALTH_PORT=${HEALTH_PORT:-3004}  # Change this if needed
HEALTH_PATH=${HEALTH_PATH:-/health}
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
# HEALTH CHECK LOOP
# -------------------------------
echo "🔍 Checking health on $INACTIVE..."
CONTAINER_IP=""
for i in {1..10}; do
    CONTAINER_ID=$(docker compose -f docker-compose.production.yml -p $APP_NAME ps -q $INACTIVE)
    if [ -z "$CONTAINER_ID" ]; then
        echo "❌ Could not find running container for $INACTIVE (attempt $i)"
        sleep 5
        continue
    fi

    CURRENT_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$CONTAINER_ID")
    if [ -z "$CURRENT_IP" ]; then
        echo "❌ Could not resolve IP for $INACTIVE container (attempt $i)"
        sleep 5
        continue
    fi

    STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://$CURRENT_IP:$HEALTH_PORT$HEALTH_PATH || echo "000")

    if [ "$STATUS" = "200" ]; then
        echo "✅ $INACTIVE is healthy and responding (HTTP 200)."
        CONTAINER_IP=$CURRENT_IP
        break
    else
        echo "⏳ $INACTIVE not healthy yet (status $STATUS)... attempt $i"
        sleep 5
    fi
done

if [ -z "$CONTAINER_IP" ]; then
    echo "❌ $INACTIVE failed health check after 10 attempts."
    echo "📦 Last 50 lines of logs for debugging:"
    docker logs --tail=50 "$CONTAINER_ID"
    echo "🚨 Rolling back, keeping $ACTIVE running."
    docker compose -f docker-compose.production.yml -p $APP_NAME stop $INACTIVE
    docker compose -f docker-compose.production.yml -p $APP_NAME rm -f $INACTIVE
    exit 1
fi

# -------------------------------
# UPDATE NGINX
# -------------------------------
echo "🔄 Switching NGINX to $INACTIVE ($CONTAINER_IP)"
export ACTIVE_APP=$CONTAINER_IP
envsubst '${ACTIVE_APP}' < $NGINX_TEMPLATE > shop.conf
sudo mv shop.conf $NGINX_CONF
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/shop.conf
sudo nginx -t
sudo systemctl reload nginx

# -------------------------------
# STOP & REMOVE OLD CONTAINER
# -------------------------------
echo "🛑 Stopping and removing old app $ACTIVE..."
docker compose -f docker-compose.production.yml -p $APP_NAME stop $ACTIVE
docker compose -f docker-compose.production.yml -p $APP_NAME rm -f $ACTIVE

echo "✅ Blue-Green Deployment Complete. Live: $INACTIVE"
