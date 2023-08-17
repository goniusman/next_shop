FROM node:16.14.0

# RUN apk add --no-cache nodejs npm yarn
WORKDIR /app
COPY  package.json yarn.lock ./
RUN yarn --network-timeout 1000000
COPY ./ ./
EXPOSE 3003
CMD ["yarn", "dev:rest"]