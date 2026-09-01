# syntax=docker/dockerfile:1
# Dockerfile genérico para el shell y cualquier módulo frontend del monorepo.
# Uso: docker build -f docker/frontend.Dockerfile \
#        --build-arg MODULE_PATH=frontend/modules/companies-users \
#        --build-arg VITE_API_BASE_URL=https://api.midominio.com/api \
#        -t dpo/module-companies-users .
#
# IMPORTANT: las variables VITE_* se incrustan en el bundle en tiempo de
# BUILD (no de runtime) — para un despliegue en producción, pasa los
# build-args correctos apuntando a los dominios reales de cada módulo.
FROM node:20-alpine AS build
WORKDIR /app
ARG MODULE_PATH
ARG VITE_API_BASE_URL
ARG VITE_REMOTE_COMPANIES_USERS
ARG VITE_REMOTE_CONSENTS
ARG VITE_REMOTE_RAT
ARG VITE_REMOTE_ARCO
ARG VITE_REMOTE_BREACHES
ARG VITE_REMOTE_RETENTION
ARG VITE_REMOTE_ETHICS_CHANNEL
ARG VITE_REMOTE_MATURITY
ARG VITE_REMOTE_TRAINING
ARG VITE_REMOTE_CONTRACTS
ARG VITE_REMOTE_AUDIT
ARG VITE_REMOTE_EVIDENCE

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_REMOTE_COMPANIES_USERS=${VITE_REMOTE_COMPANIES_USERS}
ENV VITE_REMOTE_CONSENTS=${VITE_REMOTE_CONSENTS}
ENV VITE_REMOTE_RAT=${VITE_REMOTE_RAT}
ENV VITE_REMOTE_ARCO=${VITE_REMOTE_ARCO}
ENV VITE_REMOTE_BREACHES=${VITE_REMOTE_BREACHES}
ENV VITE_REMOTE_RETENTION=${VITE_REMOTE_RETENTION}
ENV VITE_REMOTE_ETHICS_CHANNEL=${VITE_REMOTE_ETHICS_CHANNEL}
ENV VITE_REMOTE_MATURITY=${VITE_REMOTE_MATURITY}
ENV VITE_REMOTE_TRAINING=${VITE_REMOTE_TRAINING}
ENV VITE_REMOTE_CONTRACTS=${VITE_REMOTE_CONTRACTS}
ENV VITE_REMOTE_AUDIT=${VITE_REMOTE_AUDIT}
ENV VITE_REMOTE_EVIDENCE=${VITE_REMOTE_EVIDENCE}

COPY package.json package-lock.json* ./
COPY shared ./shared
COPY frontend ./frontend

RUN npm install --no-audit --no-fund
RUN npm run build --workspace=${MODULE_PATH}

FROM nginx:1.27-alpine AS runtime
ARG MODULE_PATH
COPY --from=build /app/${MODULE_PATH}/dist /usr/share/nginx/html
COPY docker/nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
