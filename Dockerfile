# --- Build stage ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copy deps
COPY package*.json ./

# Install all dependencies
RUN npm install --legacy-peer-deps

# Copy source including config files
COPY . .

# Build Next.js
RUN npm run build

# Postbuild if needed
RUN npm run postbuild || echo "No postbuild step"

# --- Production stage ---
FROM node:18-alpine AS runner

WORKDIR /app

# Copy only what is needed
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next-i18next.config.js ./next-i18next.config.js

EXPOSE 3004

CMD ["npm", "run", "start"]
