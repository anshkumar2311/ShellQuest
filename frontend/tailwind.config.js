/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#F6EFE1",
        "sand-deep": "#EDE0C8",
        card: "#FBF6EC",
        coffee: "#3B2A1E",
        "coffee-soft": "#6B5642",
        rust: "#A6572E",
        "rust-dark": "#8A4423",
        moss: "#5C7A52",
        hairline: "#D9C7A9",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
