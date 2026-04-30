# ============================================================
# MatdataMitra Frontend — Optimized for Google Cloud Run
# ============================================================

# ── Stage 1: Build ──
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments for Next.js public variables
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# Copy package files for dependency caching
COPY package.json yarn.lock* ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/frontend/package.json ./apps/frontend/

# Install all dependencies (including devDependencies for build)
RUN yarn install --frozen-lockfile

# Copy source code
COPY packages/shared-types/ ./packages/shared-types/
COPY apps/frontend/ ./apps/frontend/
COPY turbo.json ./

# Build shared types first, then frontend
WORKDIR /app/packages/shared-types
RUN yarn build

WORKDIR /app/apps/frontend
RUN yarn build

# ── Stage 2: Production ──
FROM node:20-alpine AS runner

# Security: run as non-root user
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

WORKDIR /app

# Next.js standalone output automatically copies node_modules and requires files
# Since we didn't enable standalone in Next config yet, we'll copy standard outputs
COPY --from=builder /app/apps/frontend/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared-types/package.json ./packages/shared-types/package.json
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/public ./public

# Switch to non-root user
USER appuser

# Cloud Run uses PORT env variable
ENV PORT=3000
EXPOSE 3000

CMD ["yarn", "start"]
