module.exports = {
    plugins: [
        require('@tailwindcss/postcss')(), // jalankan Tailwind lewat PostCSS
        require('postcss-preset-env')({
            stage: 3,
            autoprefixer: { grid: true },
        }),
        require('@csstools/postcss-color-mix-function')(), // optional: konversi color-mix()
        require('autoprefixer')(),
    ],
};
