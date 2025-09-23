import type { Config } from 'tailwindcss';

const config: Config = {
  // Force dark mode for consistency
  darkMode: ['class'],
  // Enhanced content scanning for HMR stability
  content: [
    './src/ui/**/*.{ts,tsx}',
    './src/ui/index.html',
    './src/ui/components/**/*.{ts,tsx}',
    './src/ui/styles/**/*.css',
  ],
  // HMR optimization - guarantee critical classes are always available
  safelist: [
    // Theme
    'dark',
    // Backgrounds
    'bg-background', 'bg-card', 'bg-muted', 'bg-secondary',
    // Text
    'text-foreground', 'text-card-foreground', 'text-muted-foreground',
    // Borders & Layout
    'border-border', 'border-b', 'flex', 'flex-col', 'h-screen', 'w-full',
    // Spacing
    'space-y-4', 'space-y-6', 'p-4', 'gap-1', 'gap-2',
    // Component essentials
    'items-center', 'justify-between', 'rounded', 'px-4', 'py-2',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
