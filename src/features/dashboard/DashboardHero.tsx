import { Sun } from "lucide-react";

interface DashboardHeroProps {
  nombre: string;
}

/**
 * Hero del Dashboard (Entrega 8) — replica la referencia: foto real de
 * fondo, saludo grande, subtítulo, y una tarjeta de clima.
 *
 * La tarjeta de clima es DECORATIVA por instrucción explícita del
 * cliente ("tarjeta pequeña de clima visual SOLO decorativa si no hay
 * endpoint real") — el backend no tiene ningún dato meteorológico.
 * Nunca se presenta como si viniera de una API real.
 */
export function DashboardHero({ nombre }: DashboardHeroProps) {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl">
      <img
        src="/park/pool-turquesa.jpg"
        alt="Cascada y alberca de aguas turquesa en EjiXhole"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />

      <div className="relative z-10 flex min-h-[13rem] flex-col justify-end p-6 text-white sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">Hola, {nombre} 🌿</h1>
            <p className="mt-1 text-sm text-white/85">
              Todo listo para crear experiencias inolvidables en contacto con la naturaleza.
            </p>
          </div>

          {/* Decorativo — sin endpoint de clima real, ver comentario arriba */}
          <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
            <Sun className="h-8 w-8 text-warning" />
            <div>
              <p className="text-lg font-semibold leading-none">24°C</p>
              <p className="text-xs text-white/75">Clima actual (referencial)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
