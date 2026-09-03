# syntax=docker/dockerfile:1
# Dockerfile genérico para cualquier microservicio backend del monorepo.
# Uso: docker build -f docker/backend.Dockerfile --build-arg SERVICE=auth-service -t dpo/auth-service .
FROM node:20-alpine AS build
WORKDIR /app
ARG SERVICE

COPY package.json package-lock.json* ./
COPY shared ./shared
COPY services ./services
COPY scripts ./scripts
COPY db ./db

RUN npm install --no-audit --no-fund
RUN npm run build --workspace=services/${SERVICE}

FROM node:20-alpine AS runtime
WORKDIR /app
ARG SERVICE
ENV NODE_ENV=production
ENV SERVICE=${SERVICE}

COPY --from=build /app /app

EXPOSE 3000-3012
CMD ["sh", "-c", "node services/${SERVICE}/dist/main.js"]
