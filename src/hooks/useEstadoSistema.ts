import { useQuery } from "@tanstack/react-query";

import { systemApi } from "@/api/system";

/**
 * Indicador real (no decorativo) de si el backend responde — usa
 * GET /status, que ya existía. Se revisa cada minuto; si falla, se
 * asume que el backend no está disponible.
 */
export function useEstadoSistema() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["system-status"],
    queryFn: systemApi.status,
    retry: false,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const enLinea = !isLoading && !isError && data?.status === "online";

  return { enLinea, cargando: isLoading };
}
