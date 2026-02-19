# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/webview/package*.json ./apps/webview/
COPY packages ./packages

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

WORKDIR /app/apps/webview
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# standalone 모드만 복사
COPY --from=builder --chown=nextjs:nodejs /app/apps/webview/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/webview/.next/static ./apps/webview/.next/static

USER nextjs

EXPOSE 10000
ENV PORT 10000

CMD ["node", "apps/webview/server.js"]
