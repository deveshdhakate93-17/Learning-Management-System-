/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          deep: '#2A4FB3',
          hover: '#1E3A8A',
        },
        secondary: '#6366F1',
        accent: '#A9C4FF',
        'light-blue': '#C7D2FE',
        'bg-page': '#F8FAFC',
        'bg-card': '#FFFFFF',
        'bg-secondary': '#EDF3FF',
        'bg-dark': '#0F1117',
        'sidebar-bg': '#0F1117',
        'sidebar-border': '#1F2937',
        'sidebar-hover': '#1A1F2E',
        'sidebar-active': '#1E3A6E',
        'sidebar-accent': '#3B82F6',
        'chat-bg': '#0f0f0f',
        'chat-sidebar': '#171717',
        'chat-card': '#212121',
        'chat-border': '#2f2f2f',
        'chat-accent': '#10a37f',
        'text-primary': '#1A1A2E',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        btn: '10px',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 2px 16px rgba(42, 79, 179, 0.08)',
        hover: '0 8px 32px rgba(42, 79, 179, 0.16)',
        glow: '0 0 20px rgba(79, 70, 229, 0.4)',
        'glow-sm': '0 0 10px rgba(79, 70, 229, 0.3)',
        'glow-lg': '0 0 40px rgba(79, 70, 229, 0.5)',
        'chat-glow': '0 0 20px rgba(16, 163, 127, 0.3)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4F46E5, #6366F1)',
        'gradient-hero': 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #8B5CF6 100%)',
        'gradient-blue': 'linear-gradient(90deg, #2A4FB3, #60A5FA)',
        'gradient-dark': 'linear-gradient(135deg, #0F1117, #1A1F2E)',
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'blob-drift': 'blobDrift 8s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',
        'fade-up': 'fadeUp 0.4s ease forwards',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        blobDrift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}
