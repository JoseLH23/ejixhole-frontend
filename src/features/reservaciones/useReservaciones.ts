import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { reservacionesApi, type ListarReservacionesParams } from "@/api/reservaciones";
import type { EstadoReservacion, ReservacionCreateInput } from "@/types/reservacion";

const RESERVACIONES_QUERY_KEY = ["reservaciones"] as const;

export function useReservaciones(params: ListarReservacionesParams = {}) {
  return useQuery({
    queryKey: [...RESERVACIONES_QUERY_KEY, params],
    queryFn: () => reservacionesApi.listar(params),
    staleTime: 30_000,
  });
}

export function useCrearReservacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReservacionCreateInput) => reservacionesApi.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVACIONES_QUERY_KEY });
    },
  });
}

/**
 * Cubre tanto "cambiar estado" como "cancelar" — cancelar es
 * exactamente esta misma mutación con `nuevo_estado: "cancelada"`. El
 * backend no tiene un endpoint de edición de detalles (fecha,
 * personas, etc.) — ver docs/entrega-3c.md.
 */
export function useCambiarEstadoReservacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nuevoEstado }: { id: number; nuevoEstado: EstadoReservacion }) =>
      reservacionesApi.cambiarEstado(id, { nuevo_estado: nuevoEstado }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVACIONES_QUERY_KEY });
    },
  });
}
