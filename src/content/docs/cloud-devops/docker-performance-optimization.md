---
title: Docker Performance & Multi-Stage Builds
description: Optimizing container image sizes, build caches, and security profiles.
---

## Multi-Stage Dockerfile Blueprint

```dockerfile
# -------------------------------------------------------------
# Stage 1: Build & Dependency Resolution
# -------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline
COPY . .
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Production Distroless Runtime
# -------------------------------------------------------------
FROM gcr.io/distroless/nodejs22-debian12 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER nonroot:nonroot
EXPOSE 3000
CMD ["dist/server.js"]
```
