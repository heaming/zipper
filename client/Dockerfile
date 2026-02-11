# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# monorepo 전체 구조 복사
COPY package.json package-lock.json* ./
COPY apps/webview/package*.json ./apps/webview/
COPY packages ./packages

# 의존성 설치 (package-lock.json이 있으면 npm ci, 없으면 npm install)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules

# 소스 코드 복사
COPY . .

# 환경 변수 설정 (빌드 타임)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Next.js 빌드
WORKDIR /app/apps/webview
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# 그룹과 유저 추가
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# standalone 모드 사용 (next.config.js에서 output: 'standalone' 설정 시)
# .next/standalone 디렉토리에 모든 필요한 파일이 포함됨
COPY --from=builder --chown=nextjs:nodejs /app/apps/webview/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/webview/.next/static ./apps/webview/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/webview/public ./apps/webview/public

USER nextjs

# Render는 PORT 환경 변수를 자동으로 설정합니다
EXPOSE 10000

ENV PORT 10000

# standalone 모드에서는 server.js를 실행
CMD ["node", "apps/webview/server.js"]
