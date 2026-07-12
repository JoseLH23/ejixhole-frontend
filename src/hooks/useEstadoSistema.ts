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
 * 2. Portal público de reservaciones — fetch a la URL pública real
 *    (ejixhole-reservas.vercel.app) en modo "no-cors": el navegador no
 *    deja leer el contenido de una respuesta cross-origin así, pero SÍ
 *    distingue una respuesta de red exitosa de una caída real (DNS,
 *    timeout, 5xx de Vercel) — suficiente para un indicador honesto de
 *    "¿el sitio responde?", sin inventar un endpoint que no existe.
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
    await fetch("https://ejixhole-reservas.vercel.app/", {
      mode: "no-cors",
      cache: "no-store",
    });
    // Con no-cors, una respuesta "opaque" ya significa que el fetch no
    // fue rechazado por la red — es la señal más honesta disponible
    // sin poder leer el status code real cross-origin.
    return "en_linea";
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
