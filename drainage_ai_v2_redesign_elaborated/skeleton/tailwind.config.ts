import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        foreground: '#FFFFFF',
        'glass': 'rgba(255, 255, 255, 0.03)',
        'glass-border': 'rgba(255, 255, 255, 0.08)',
        
        'brand': {
          primary: '#0066FF',
          cyan: '#00F2FF',
          purple: '#7000FF',
        },
        
        'status': {
          critical: '#FF3B3B',
          warning: '#F5A524',
          ok: '#17C964',
        },
      },
      
      borderRadius: {
        sm: '12px',
        md: '18px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
      },
      
      fontFamily: {
        sans: ['Inter Tight', '-apple-system', 'BlinkMacSystemFont', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      
      backdropBlur: {
        '2xl': '40px',
      },
      
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 1.2s ease-in-out infinite',
        'breathe': 'breathe 6s ease-in-out infinite',
        'glitch': 'glitch 0.2s ease-in-out',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.8)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.05' },
          '50%': { transform: 'scale(1.2)', opacity: '0.1' },
        },
        glitch: {
          '0%': { transform: 'skewX(0deg)', opacity: '1' },
          '25%': { transform: 'skewX(-5deg)', opacity: '0.8' },
          '50%': { transform: 'skewX(5deg)', opacity: '1' },
          '75%': { transform: 'skewX(-2deg)', opacity: '0.9' },
          '100%': { transform: 'skewX(0deg)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '200% 200%' },
        },
      },
      
      boxShadow: {
        'glow-primary': '0 0 40px -10px rgba(0, 102, 255, 0.3)',
        'glow-critical': '0 0 40px -10px rgba(255, 59, 59, 0.3)',
        'glow-warning': '0 0 40px -10px rgba(245, 165, 36, 0.3)',
        'glow-cyan': '0 0 40px -10px rgba(0, 242, 255, 0.3)',
      },
      
      backgroundImage: {
        'mesh-gradient': `
          radial-gradient(at 0% 0%, rgba(0, 102, 255, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(112, 0, 255, 0.1) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(0, 242, 255, 0.1) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(255, 59, 59, 0.05) 0px, transparent 50%)
        `,
      },
    },
  },
  plugins: [
    function ({ addUtilities }: any) {
      addUtilities({
        '.glass-card': {
          '@apply bg-glass backdrop-blur-2xl border border-glass-border rounded-lg transition-all duration-500': {},
        },
        '.glass-card-hover': {
          '@apply hover:bg-white/5 hover:border-white/20 hover:shadow-glow-primary hover:scale-105': {},
        },
        '.glow-text': {
          'text-shadow': '0 0 20px rgba(255, 255, 255, 0.5)',
        },
      });
    },
  ],
};

export default config;
