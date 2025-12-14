// tailwind.config.js
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-noto)", "system-ui", "sans-serif"],
      },
      colors: {
        background: {
          light: "#ffffff",
          dark: "#0f1115", // Linear base
        },
        surface: {
          light: "#f5f6f8",
          dark: "#151821", // Linear surface
        },
        border: {
          light: "#e4e6eb",
          dark: "#232633",
        },
        text: {
          primary: {
            light: "#1f2937",
            dark: "#e6e8eb",
          },
          muted: {
            light: "#6b7280",
            dark: "#9aa1ad",
          },
        },

        // 컬러 테마는 변수로 받음
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          soft: "var(--accent-soft)",
        },
      },
    },
  },
  plugins: [],
};
