# Robustní build pro Next.js + Prisma na Renderu (Alpine + OpenSSL)
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json ./
# když existuje lockfile, použij ci; jinak normální install
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps --no-audit --no-fund; \
    else npm install --legacy-peer-deps --no-audit --no-fund; fi

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production \
    TZ=Europe/Prague \
    NEXT_TELEMETRY_DISABLED=1 \
    TSC_COMPILE_ON_ERROR=true
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma client s logy + build s verbose výstupem
RUN node -v && npm -v && npx prisma -v \
 && npx prisma generate --log-level debug \
 && npm run build --loglevel verbose

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV TZ=Europe/Prague
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm","start"]
