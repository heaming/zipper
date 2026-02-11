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
  
  // WebView에서 사용하지 않을 기능 비활성화
  // swcMinify: true,
  //
  // // Docker 배포를 위한 standalone 출력
  // output: 'standalone',
  //
  // // 빌드 최적화
  // experimental: {
  //   // 빌드 트레이스 수집 최적화
  //   optimizePackageImports: ['lucide-react'],
  // },
}

module.exports = nextConfig
