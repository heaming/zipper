/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 이미지 최적화 (WebView 고려)
  images: {
    formats: ['image/webp'],
  },
  
  // 환경변수
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
  // 빌드 시 특정 경로를 동적으로 처리
  experimental: {
    // 동적 라우트 강제
  },
  // 동적 라우트 설정 (useSearchParams 사용 페이지)
  output: 'standalone', // Docker 배포를 위한 설정
  
  // WebView에서 사용하지 않을 기능 비활성화
  swcMinify: true,
}

module.exports = nextConfig
