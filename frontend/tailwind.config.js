/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102033",
        mist: "#ecf3f9",
        accent: "#0f766e",
        sand: "#f7f4ed"
      }
    }
  },
  plugins: []
};
