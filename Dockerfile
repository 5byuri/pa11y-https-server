# Copyright 2025 Zentrum für Digitale Souveränität der Öffentlichen Verwaltung (ZenDiS) GmbH.
# SPDX-License-Identifier: MIT

# Build application
FROM node:24.10.0-trixie@sha256:b9d0ae8cc159111daedfd5cc3450a1b1ffe9d77d19d6e9755c7a38a3ae4da24c AS builder

WORKDIR /production-process
# RUN npm install pkgroll
COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY . .
RUN npm run build

# create final image

FROM gcr.io/distroless/nodejs24-debian12:nonroot@sha256:1399bb61af6b38c31ce4d3770546736a691a3ac70bcba84454a24469911fa260
USER 1000
WORKDIR /app
COPY --from=builder /production-process/node_modules /app/node_modules
COPY --from=builder /production-process/dist /app/dist

EXPOSE 50259

CMD ["/app/dist/server/index.mjs"]

# node dist/server/index.mjs