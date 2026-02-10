# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# monorepo 전체 구조 복사
COPY package*.json ./
COPY apps/webview/package*.json ./apps/webview/
COPY packages ./packages

# 의존성 설치 (workspace 전체)
RUN npm ci

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

# Next.js 빌드 결과물 복사
COPY --from=builder /app/apps/webview/public ./public

# standalone 모드가 활성화되어 있으면 사용, 아니면 일반 빌드 사용
COPY --from=builder --chown=nextjs:nodejs /app/apps/webview/.next ./.next
COPY --from=builder /app/apps/webview/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 3001

ENV PORT 3001

CMD ["npm", "start"]
