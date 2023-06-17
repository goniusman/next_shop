FROM node:16.13.0

# RUN apk add --no-cache nodejs npm yarn
WORKDIR /app
COPY  package.json yarn.lock ./
RUN yarn 
COPY ./ ./
EXPOSE 3003
CMD ["yarn", "dev:rest"]