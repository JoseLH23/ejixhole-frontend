import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 5173,
    },
    build: {
        rollupOptions: {
            output: {
                // Recharts es la dependencia más pesada del proyecto y la
                // usan Dashboard + 4 reportes — separarla en su propio chunk
                // evita que se duplique entre los chunks de esas rutas
                // (Rollup ya la comparte automáticamente vía import dinámico,
                // pero esto lo hace explícito y más fácil de cachear en el
                // navegador entre despliegues que no tocan gráficas).
                manualChunks: {
                    recharts: ["recharts"],
                    "react-vendor": ["react", "react-dom", "react-router-dom"],
                },
            },
        },
    },
});
