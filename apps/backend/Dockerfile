# ============================================================
# MatdataMitra Backend — Optimized for Google Cloud Run
# ============================================================

# ── Stage 1: Build ──
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for dependency caching
COPY package.json yarn.lock* ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/backend/package.json ./apps/backend/

# Install all dependencies (including devDependencies for build)
RUN yarn install --frozen-lockfile

# Copy source code
COPY packages/shared-types/ ./packages/shared-types/
COPY apps/backend/ ./apps/backend/

# Build shared types first, then backend
WORKDIR /app/packages/shared-types
RUN yarn build

WORKDIR /app/apps/backend
RUN yarn build

# ── Stage 2: Production ──
FROM node:20-alpine AS runner

# Security: run as non-root user
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

WORKDIR /app

# Copy package files and install production-only deps
COPY package.json yarn.lock* ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/backend/package.json ./apps/backend/

RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# Copy built artifacts
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Switch to non-root user
USER appuser

# Cloud Run uses PORT env variable (default 8080)
ENV PORT=8080
EXPOSE 8080

WORKDIR /app/apps/backend

CMD ["node", "dist/index.js"]
