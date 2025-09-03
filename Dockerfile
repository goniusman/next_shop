# --- Base build stage ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copy deps
COPY package*.json ./

# Install dependencies (with dev deps, needed for build)
RUN npm install --omit=dev --legacy-peer-deps

# Copy source
COPY . .

# Build app ds 
RUN npm run build

# Run postbuild (if actually needed for NestJS — skip if it's Next.js-only)
RUN npm run postbuild || echo "No postbuild step"


# --- Production runtime stage ---
FROM node:18-alpine AS runner

WORKDIR /app

# Copy only production deps
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy build output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Expose NestJS port (sync with .env)
EXPOSE 3003

# Start app
CMD ["npm", "run", "start"]



# FROM node:16.14.0
# # RUN apk add --no-cache nodejs npm yarn
# WORKDIR /app
# COPY  package.json yarn.lock ./
# RUN yarn --network-timeout 1000000
# COPY ./ ./
# EXPOSE 3003
# CMD ["yarn", "dev:rest"]




