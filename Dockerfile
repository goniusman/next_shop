# --- Base deps stage ---
FROM node:18-alpine AS deps

WORKDIR /app

# Install OS deps (sometimes needed for sharp, canvas, etc.)
RUN apk add --no-cache libc6-compat

# Copy only package files first (better caching)
COPY package.json package-lock.json* ./

# Install deps (cacheable)
RUN npm ci --legacy-peer-deps


# --- Builder stage ---
FROM node:18-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build
RUN npm run postbuild || echo "No postbuild step"


# --- Production runner stage ---
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only required files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/next-i18next.config.js ./next-i18next.config.js

EXPOSE 3004
CMD ["npm", "run", "start"]
