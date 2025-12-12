/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class", // 반드시 필요
    content: [
        "./src/app/**/*.{ts,tsx}",
        "./src/components/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
