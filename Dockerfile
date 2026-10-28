# =========================================================================
# TechPulse Modular E-Commerce Engine - Multi-Stage Production Dockerfile
# =========================================================================

# -------------------------------------------------------------------------
# STAGE 1: Build React SPA Client (Storefront & Admin)
# -------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# -------------------------------------------------------------------------
# STAGE 2: Production Node.js Engine
# -------------------------------------------------------------------------
FROM node:20-alpine AS runner

# Create non-root user for security best practices
RUN addgroup -g 1001 -S techpulse && adduser -u 1001 -S techpulse -G techpulse

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy backend source code
COPY src/ ./src/
COPY server.js ./

# Copy compiled frontend build from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Ensure required directories exist and belong to non-root user
RUN mkdir -p public/uploads .pglite-data && chown -R techpulse:techpulse /app

# Switch to non-root user
USER techpulse

# Healthcheck probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

EXPOSE 3000

CMD ["node", "server.js"]
