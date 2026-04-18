module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-blue": "#102542",
        "darker-blue": "#0A1A2B",
        cyan: "#087F8C",
        background: "#FFF0EB",
        orange: "#EF8354",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease forwards",
      },
    },
  },
  plugins: [],
};
