import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // 커뮤니티 태그 클래스들을 safelist에 추가
    'tag-all',
    'tag-togather',
    'tag-share',
    'tag-lifestyle',
    'tag-chat',
    'tag-market',
    'tag-bg-all',
    'tag-bg-togather',
    'tag-bg-share',
    'tag-bg-lifestyle',
    'tag-bg-chat',
    'tag-bg-market',
  ],
  theme: {
    extend: {
      colors: {
        // Toss 스타일 컬러 팔레트 (회색 배경)
        background: '#f7f7f8',  // 기본 회색 배경
        surface: '#ffffff',      // 카드는 흰색
        border: '#e5e7eb',
        
        // Text colors
        text: {
          primary: '#111111',
          secondary: '#6b7280',
          tertiary: '#9ca3af',
        },
        
        // Primary (Point color)
        primary: {
          DEFAULT: '#4ccf89',
          light: '#6fd99d',
          dark: '#3cb575',
        },
        
        // Gray scale (neutral)
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      
      // 둥근 radius (md~lg)
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      
      // 그림자 최소
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        md: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
      },
      
      // 모바일 터치 영역 최소 44px
      spacing: {
        'touch': '44px',
      },
      
      // 애니메이션
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
