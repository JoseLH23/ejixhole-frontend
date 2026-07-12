import * as React from "react";
import { Sun, Cloud, CloudRain, CloudFog } from "lucide-react";

import { useClimaElNaranjo, descripcionClima } from "@/hooks/useClimaElNaranjo";

interface DashboardHeroProps {
  nombre: string;
}

// Foto real y verificada: es el propio og:image del sitio público de
// EjiXhole (ejixhole-reservas.vercel.app), confirmado en el <head> de
// esa página — la misma imagen que ya se usa como PageHeader de
// Reservaciones y que carga correctamente en producción. Reemplaza
// `/park/pool-turquesa.jpg`, que no existe realmente desplegado (por
// eso se veía como texto alternativo roto).
const IMAGEN_HERO = "https://ejixhole-reservas.vercel.app/gallery/hero-principal.jpg";

function IconoClima({ codigo }: { codigo: number }) {
  if (codigo === 0 || codigo <= 3) return <Sun className="h-6 w-6 text-warning" />;
  if (codigo <= 48) return <CloudFog className="h-6 w-6 text-muted-foreground" />;
  if (codigo <= 82) return <CloudRain className="h-6 w-6 text-secondary" />;
  return <Cloud className="h-6 w-6 text-muted-foreground" />;
}

/**
 * Hero del Dashboard. Imagen real verificada (ver comentario arriba,
 * con fallback visual a `.gradient-mesh-hero` si por algún motivo
 * falla la carga — nunca queda un ícono de imagen rota ni texto
 * alternativo expuesto). Clima real de El Naranjo, S.L.P. vía
 * Open-Meteo (sin API key, ver useClimaElNaranjo.ts) — ya no es un
 * dato fijo de 24°C.
 */
export function DashboardHero({ nombre }: DashboardHeroProps) {
  const [imagenFallo, setImagenFallo] = React.useState(false);
  const { data: clima, isLoading: cargandoClima, isError: errorClima } = useClimaElNaranjo();

  return (
    <div className={`relative isolate overflow-hidden rounded-2xl ${imagenFallo ? "gradient-mesh-hero" : ""}`}>
      {!imagenFallo && (
        <img
          src={IMAGEN_HERO}
          alt=""
          onError={() => setImagenFallo(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/5" />

      <div className="relative z-10 flex min-h-[8rem] flex-col justify-end p-5 text-white sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">Hola, {nombre} 🌿</h1>
            <p className="mt-0.5 text-sm text-white/85">
              Todo listo para crear experiencias inolvidables en contacto con la naturaleza.
            </p>
          </div>

          {/* Clima real de El Naranjo, S.L.P. — Open-Meteo, sin API key */}
          <div className="flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 backdrop-blur-md">
            {cargandoClima || !clima ? (
              <>
                <Sun className="h-6 w-6 animate-pulse text-white/50" />
                <div>
                  <p className="text-base font-semibold leading-none">
                    {errorClima ? "—" : <span className="inline-block h-4 w-8 animate-pulse rounded bg-white/20" />}
                  </p>
                  <p className="text-[11px] text-white/75">
                    {errorClima ? "Clima no disponible" : "Cargando clima..."}
                  </p>
                </div>
              </>
            ) : (
              <>
                <IconoClima codigo={clima.codigoClima} />
                <div>
                  <p className="text-base font-semibold leading-none">{clima.temperaturaC}°C</p>
                  <p className="text-[11px] text-white/75">
                    {descripcionClima(clima.codigoClima)} · El Naranjo, S.L.P.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
