# Node Version
FROM node:alpine

# RUN yarn --network-timeout 100000

# Set work directory
WORKDIR /app

# Copy dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy app files
COPY . .

# Postbuild app
RUN npm run postbuild

# Build app
RUN npm run build

# Expose NestJS port (adjust if needed)
EXPOSE 3004

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




