/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Verde selva/naturaleza — color de marca principal.
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Turquesa agua — los ríos de la Huasteca (Tamul, Puente de Dios).
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // Beige/madera cálido — usado como fondo sutil de hover/acento.
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        // Madera más saturada, para acentos puntuales (iconos, bordes
        // destacados) — distinto de `accent`, que es un fondo sutil.
        wood: {
          DEFAULT: "hsl(var(--wood))",
          foreground: "hsl(var(--wood-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Superficie elevada (tarjetas dentro de tarjetas, popovers) —
        // distinta del fondo general de la app.
        surface: "hsl(var(--surface))",

        // Colores de estado — un solo lugar para todo el sistema
        // (usados por <Badge estado="..." /> / <EstadoBadge />).
        // Cubre TODOS los estados reales del backend en los 8 módulos:
        // Reservaciones (pendiente/confirmada/completada/cancelada),
        // Clientes/Servicios (activo/inactivo), Caja (abierta/cerrada).
        estado: {
          pendiente: "hsl(var(--estado-pendiente))",
          confirmada: "hsl(var(--estado-confirmada))",
          completada: "hsl(var(--estado-completada))",
          cancelada: "hsl(var(--estado-cancelada))",
          activo: "hsl(var(--estado-activo))",
          inactivo: "hsl(var(--estado-inactivo))",
          abierta: "hsl(var(--estado-abierta))",
          cerrada: "hsl(var(--estado-cerrada))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 6px)",
      },
      boxShadow: {
        premium: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 4px 16px -4px rgb(24 60 45 / 0.10)",
        "premium-lg": "0 2px 4px 0 rgb(0 0 0 / 0.04), 0 12px 32px -8px rgb(24 60 45 / 0.16)",
        "premium-hover": "0 4px 8px 0 rgb(0 0 0 / 0.05), 0 16px 40px -8px rgb(24 60 45 / 0.20)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.35s ease-out",
        shimmer: "shimmer 1.8s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
