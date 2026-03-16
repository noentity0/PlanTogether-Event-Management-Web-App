/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        appbg: "#121212",
        surface: "#1E1E1E",
        field: "#2A2A2A",
        accent: "#FF8C00",
        "accent-light": "#FFA500",
        textmain: "#FFFFFF",
        textmuted: "#B0B0B0",
      },
      boxShadow: {
        soft: "0 18px 70px rgba(0, 0, 0, 0.35)",
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(circle at top left, rgba(255, 140, 0, 0.18), transparent 28%), radial-gradient(circle at top right, rgba(255, 165, 0, 0.14), transparent 30%), linear-gradient(180deg, #121212 0%, #171717 52%, #121212 100%)",
      },
    },
  },
  plugins: [],
};
