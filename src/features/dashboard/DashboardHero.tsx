import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Waves } from "lucide-react";

import { ParkIllustration } from "@/components/brand/ParkIllustration";
import { formatearValor, inferirFormato } from "./formatters";
import type { Tarjeta } from "@/types/dashboard";

interface DashboardHeroProps {
  nombre: string;
  fecha: string;
  tarjetas: Tarjeta[];
}

/**
 * Panel hero del Dashboard — reemplaza el encabezado de texto plano
 * que existía antes por el mismo lenguaje visual del Login
 * (gradient-mesh + ilustración de marca), con la métrica más
 * importante destacada en grande.
 *
 * Identifica "Ingresos del mes" por título exacto para destacarla —
 * mismo acoplamiento ya documentado y aceptado en KpiCard.tsx
 * (ICONO_POR_TITULO) y formatters.ts (TITULOS_PORCENTAJE). Si el
 * backend algún día renombra la tarjeta, esto simplemente no
 * encuentra nada que destacar y el hero se ve sin la cifra grande —
 * nunca revienta.
 */
export function DashboardHero({ nombre, fecha, tarjetas }: DashboardHeroProps) {
  const destacada = tarjetas.find((t) => t.titulo === "Ingresos del mes");
  const chips = tarjetas.filter(
    (t) => t.titulo === "Reservaciones activas" || t.titulo === "Clientes nuevos (mes)"
  );

  const fechaFormateada = (() => {
    try {
      return format(new Date(`${fecha}T00:00:00`), "EEEE d 'de' MMMM", { locale: es });
    } catch {
      return fecha;
    }
  })();

  return (
    <div className="gradient-mesh-hero dot-grid relative overflow-hidden rounded-2xl p-6 text-primary-foreground sm:p-8">
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium capitalize">
            <Waves className="h-3 w-3" />
            {fechaFormateada}
          </p>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Hola, {nombre} 🌿</h1>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Así va EjiXhole hoy — todo en un vistazo.
          </p>
        </div>

        {destacada && (
          <div className="glass-panel animate-fade-in-up rounded-2xl px-6 py-4">
            <p className="text-xs uppercase tracking-wider text-primary-foreground/70">
              {destacada.titulo}
            </p>
            <p className="font-display text-4xl font-semibold tabular-nums">
              {formatearValor(destacada.valor, inferirFormato(destacada.titulo, destacada.valor))}
            </p>
          </div>
        )}
      </div>

      {chips.length > 0 && (
        <div className="relative z-10 mt-6 flex flex-wrap gap-3">
          {chips.map((c) => (
            <div
              key={c.titulo}
              className="glass-panel flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
            >
              <span className="text-primary-foreground/70">{c.titulo}:</span>
              <span className="font-semibold tabular-nums">
                {formatearValor(c.valor, inferirFormato(c.titulo, c.valor))}
              </span>
            </div>
          ))}
        </div>
      )}

      <ParkIllustration className="pointer-events-none absolute -bottom-6 right-0 h-40 w-72 opacity-60 sm:h-48 sm:w-96" />
    </div>
  );
}
