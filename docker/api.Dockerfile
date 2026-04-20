FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

FROM dependencies AS builder

COPY tsconfig.json knexfile.ts ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY docker/api-entrypoint.sh /usr/local/bin/api-entrypoint.sh

RUN chmod +x /usr/local/bin/api-entrypoint.sh

USER node

EXPOSE 3000

ENTRYPOINT ["api-entrypoint.sh"]
