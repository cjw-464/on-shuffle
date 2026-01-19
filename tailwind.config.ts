import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        'preset-appear': {
          '0%': { opacity: '0', transform: 'scale(0.8) translateY(4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'led-pulse': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 6px rgba(245,158,11,0.8)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 10px rgba(245,158,11,1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'preset-appear': 'preset-appear 0.3s ease-out forwards',
        'led-pulse': 'led-pulse 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};
export default config;
