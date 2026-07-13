n /** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Tajawal',
          'IBM Plex Sans Arabic',
          'Inter',
          'sans-serif',
        ],
        latin: [
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'Courier New',
          'monospace',
        ],
      },
      colors: {
        // Light Theme Palette (Primary) — synced with globals.css :root
        background: '#F9FAFB',   // Gray-50 background canvas
        text: '#111827',         // Gray-900 primary text (16.1:1 contrast ✅)
        primary: '#4F46E5',      // Indigo-600 brand primary
        secondary: '#0D9488',    // Teal-600 secondary
        success: '#15803D',      // Green-700 (WCAG AA on green-100 ✅)
        warning: '#B45309',      // Amber-700 (WCAG AA on amber-100 ✅)
        danger: '#B91C1C',       // Red-700 (WCAG AA on red-100 ✅)
        muted: '#6B7280',        // Gray-500 secondary text
        border: '#E5E7EB',       // Gray-200 borders
        
        // Extended palette for components
        bg: {
          base: '#F9FAFB',       // Gray-50
          elevated: '#FFFFFF',   // White
          surface: '#F3F4F6',    // Gray-100
          overlay: '#E5E7EB',    // Gray-200
        },
        brand: {
          DEFAULT: '#4F46E5',   // Indigo-600
          light: '#6366F1',     // Indigo-500
          dim: '#EEF2FF',       // Indigo-50
        },
        success: {
          DEFAULT: '#15803D',   // Green-700 — 5.1:1 on green-100 ✅
          light: '#16A34A',     // Green-600
          dim: '#DCFCE7',       // Green-100
        },
        warning: {
          DEFAULT: '#B45309',   // Amber-700 — 5.8:1 on amber-100 ✅
          light: '#D97706',     // Amber-600
          dim: '#FEF3C7',       // Amber-100
        },
        danger: {
          DEFAULT: '#B91C1C',   // Red-700 — 6.3:1 on red-100 ✅
          light: '#DC2626',     // Red-600
          dim: '#FEE2E2',       // Red-100
        },
        info: {
          DEFAULT: '#0E7490',   // Cyan-700 — 5.4:1 on cyan-100 ✅
          light: '#0891B2',     // Cyan-600
          dim: '#CFFAFE',       // Cyan-100
        },
        text: {
          primary: '#111827',   // Gray-900 — WCAG AAA (16.1:1 on #F9FAFB) ✅
          secondary: '#374151', // Gray-700 — WCAG AA  (7.4:1 on #F9FAFB)  ✅
          muted: '#6B7280',     // Gray-500 — WCAG AA  (4.6:1 on #F9FAFB)  ✅
          disabled: '#9CA3AF',  // Gray-400
        },
        border: {
          DEFAULT: '#E5E7EB',   // Gray-200
          subtle: '#F3F4F6',    // Gray-100
          strong: '#D1D5DB',    // Gray-300
        },
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        full: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0,0,0,0.05)',
        sm: '0 1px 3px rgba(0,0,0,0.1)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 15px rgba(0,0,0,0.1)',
        glow: '0 0 20px rgba(79,70,229,0.15)',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
