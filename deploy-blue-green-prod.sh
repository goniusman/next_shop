#!/bin/bash

set -e

# Validate required IMAGE_TAG
if [ -z "$IMAGE_TAG" ]; then
  echo "❌ ERROR: IMAGE_TAG is not set. Aborting."
  exit 1
fi

# Determine active and inactive service
# GREEN_PORT=3004
# BLUE_PORT=3005
if docker compose -f docker-compose.production.yml -p shop_bazar ps | grep -q shop_bazar_blue; then
  ACTIVE="shop_bazar_blue"
  INACTIVE="shop_bazar_green"
#   ACTIVE_PORT=$GREEN_PORT
#   TARGET_PORT=$BLUE_PORT
else
  ACTIVE="shop_bazar_green"
  INACTIVE="shop_bazar_blue"
#   ACTIVE_PORT=$BLUE_PORT
#   TARGET_PORT=$GREEN_PORT
fi

echo "🔁 Active: $ACTIVE"
echo "🚀 Deploying to: $INACTIVE with image tag: $IMAGE_TAG"


# Start inactive app container (using already built image)
echo "⏳ Starting $INACTIVE with new image..."
docker compose -f docker-compose.production.yml -p shop_bazar up -d --no-deps --force-recreate \
  --scale $INACTIVE=1 $INACTIVE

# Health check
echo "🔍 Checking health on $INACTIVE.."
CONTAINER_IP=""
for i in {1..10}; do
  
  CONTAINER_ID=$(docker compose -f docker-compose.production.yml -p shop_bazar ps -q $INACTIVE)

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

  STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://$CURRENT_IP:3004/health || echo "000")

  if [ "$STATUS" = "200" ]; then
    echo "✅ $INACTIVE is healthy and responding (HTTP 200)."
    CONTAINER_IP=$CURRENT_IP   # ✅ persist here
    break
  else
    echo "⏳ $INACTIVE not healthy yet (status $STATUS)... attempt $i"
  fi

  sleep 5
done

if [ -z "$CONTAINER_IP" ]; then
  echo "❌ $INACTIVE failed health check after 10 attempts."
  docker logs "$CONTAINER_ID"
  exit 1
fi


# Update NGINX to point to new port
echo "Switching NGINX to $INACTIVE ($CONTAINER_IP)"
export ACTIVE_APP=$CONTAINER_IP
echo "ACTIVE_APP=$ACTIVE_APP"

envsubst '${ACTIVE_APP}' < ./nginx/nginx.conf > shop.conf
sudo mv shop.conf /etc/nginx/sites-available/shop.conf
sudo ln -sf /etc/nginx/sites-available/shop.conf /etc/nginx/sites-enabled/shop.conf

sudo nginx -t
sudo systemctl reload nginx



# Stop the previous app container
echo "🛑 Stopping and removing old app $ACTIVE... "
docker compose -f docker-compose.production.yml -p shop_bazar stop $ACTIVE
docker compose -f docker-compose.production.yml -p shop_bazar rm -f $ACTIVE

echo "✅ Blue-Green Deployment Complete. Live: $INACTIVE"
