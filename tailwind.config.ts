import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4f46e5",
          dark: "#4338ca",
          light: "#6366f1",
        },
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "sans-serif"],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #4f46e5, #6366f1, #3b82f6)',
        'gradient-secondary': 'linear-gradient(to right, #3b82f6, #6366f1)',
        'gradient-accent': 'linear-gradient(to right, #9333ea, #6366f1)',
        'gradient-radial-soft': 'radial-gradient(circle at center, rgba(99,102,241,0.08), transparent)',
        'gradient-radial-hero': 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.1), transparent)',
      },
      boxShadow: {
        'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-soft': '0 4px 20px rgba(99, 102, 241, 0.1)',
        'card': '0 4px 16px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
export default config;

