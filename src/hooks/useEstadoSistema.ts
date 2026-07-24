import { useQuery } from "@tanstack/react-query";

import { systemApi } from "@/api/system";

export type EstadoConexion = "en_linea" | "degradado" | "sin_conexion";

export interface EstadoSistemaItem {
  id: "backend" | "portal" | "frontend";
  nombre: string;
  estado: EstadoConexion;
}

/**
 * Revisa por HTTP real los 3 sistemas del ecosistema EjiXhole:
 *
 * 1. Backend API — GET /status (ya existía, público, sin auth).
 * 2. Portal público de reservaciones — GET /portal-health usa un proxy
 *    same-origin de Vercel hacia ejixhole-reservas.vercel.app. Así el
 *    navegador puede leer el status HTTP real sin CORS ni relajar
 *    connect-src para conexiones arbitrarias.
 * 3. Frontend administrativo — si este código se está ejecutando, el
 *    frontend está, por definición, en línea. No es un dato inventado:
 *    es el hecho más verificable de los tres.
 *
 * "Degradado" se usa cuando el backend responde pero con un status
 * distinto de "online" (ej. degradado a propósito, mantenimiento).
 */
async function verificarBackend(): Promise<EstadoConexion> {
  try {
    const data = await systemApi.status();
    return data.status === "online" ? "en_linea" : "degradado";
  } catch {
    return "sin_conexion";
  }
}

async function verificarPortalPublico(): Promise<EstadoConexion> {
  try {
    const respuesta = await fetch("/portal-health", {
      cache: "no-store",
    });
    return respuesta.ok ? "en_linea" : "sin_conexion";
  } catch {
    return "sin_conexion";
  }
}

export function useEstadoSistemas() {
  const { data, isLoading } = useQuery({
    queryKey: ["estado-sistemas"],
    queryFn: async (): Promise<EstadoSistemaItem[]> => {
      const [backend, portal] = await Promise.all([verificarBackend(), verificarPortalPublico()]);
      return [
        { id: "backend", nombre: "Backend API", estado: backend },
        { id: "portal", nombre: "Portal público de reservaciones", estado: portal },
        { id: "frontend", nombre: "Frontend administrativo", estado: "en_linea" },
      ];
    },
    retry: false,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const backend = data?.find((s) => s.id === "backend");
  // Compatibilidad con el uso simple que ya tenía el Topbar (un solo punto).
  const enLinea = !isLoading && backend?.estado === "en_linea";

  return { sistemas: data ?? [], enLinea, cargando: isLoading };
}
