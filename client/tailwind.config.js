/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1A1A2E",
        indigo: {
          50: "#EEF0F9",
          500: "#3B4A8C",
          600: "#2A3666",
          900: "#1B2559",
        },
        teal: {
          50: "#E6FBF9",
          400: "#2DD4C8",
          500: "#0EA5A0",
          600: "#0B8580",
        },
        amber: {
          50: "#FEF6E7",
          400: "#F8B84E",
          500: "#F5A524",
        },
        canvas: "#FAFAF8",
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
