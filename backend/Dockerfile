FROM node:20-alpine AS builder

WORKDIR /app

# package-lock.json이 있으면 복사, 없으면 package.json만 복사
COPY package.json ./
COPY package-lock.json* ./

# package-lock.json이 있으면 npm ci, 없으면 npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY package.json ./
COPY package-lock.json* ./

# package-lock.json이 있으면 npm ci, 없으면 npm install
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY --from=builder /app/dist ./dist

# Render는 PORT 환경 변수를 자동으로 설정합니다
EXPOSE 10000

CMD ["node", "dist/apps/api/src/main"]
