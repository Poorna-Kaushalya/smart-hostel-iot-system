/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3366FF",
          hover: "#254EDA",
          light: "#EEF1FB",
        },
        secondary: {
          DEFAULT: "#1F3FBB",
        },
        status: {
          good: "#4CAF50",
          moderate: "#FFC107",
          high: "#F44336",
          neutral: "#64748B",
        },
        card: {
          temperature: "#FFE8D6",
          humidity: "#E3F2FD",
          airQuality: "#E8F5E9",
          power: "#FFF3E0",
          alerts: "#FFEBEE",
        },
        text: {
          primary: "#1E293B",
          secondary: "#475569",
          muted: "#94A3B8",
        },
      },
    },
  },
  plugins: [],
};