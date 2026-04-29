# MatdataMitra Frontend — Next.js Dockerfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:20-alpine AS runner
RUN addgroup --system --gid 1001 appgroup && adduser --system --uid 1001 appuser
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
USER appuser
ENV PORT=3000
EXPOSE 3000
CMD ["yarn", "start"]
