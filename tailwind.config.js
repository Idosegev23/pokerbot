/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B1226',
        text: '#D9CEBA',
        foreground: '#D9CEBA',
        accent: '#D9CEBA',
        success: '#22C55E',
        error: '#EF4444',
        card: '#131F26',
        primary: '#0B1226',
        secondary: '#131F26',
        muted: '#010D00',
        'muted-foreground': '#D9CEBA',
        'card-foreground': '#F2E8D5',
        'accent-foreground': '#0B1226',
        'primary-foreground': '#F2E8D5',
        'secondary-foreground': '#F2E8D5',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      fontFamily: {
        sans: ['Heebo', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        '2xl': '1rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fadeInUp": {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fadeInUp": "fadeInUp 0.3s ease-out forwards",
      },
      boxShadow: {
        'card': '0 6px 20px rgba(0,0,0,.1)',
        'xl': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      gridTemplateColumns: {
        'auto-fill-cards': 'repeat(auto-fill, minmax(280px, 1fr))',
      },
    },
  },
  plugins: [
    require('tailwindcss-rtl'),
    require('tailwindcss-animate'),
  ],
}; 