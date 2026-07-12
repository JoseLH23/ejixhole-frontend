import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { reservacionesApi, type ListarReservacionesParams } from "@/api/reservaciones";
import type { EstadoReservacion, ReservacionCreateInput, ReservacionUpdateInput } from "@/types/reservacion";

export const RESERVACIONES_QUERY_KEY = ["reservaciones"] as const;

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
 * Edita fechas, personas, servicio y/o notas de una reservación ya
 * creada — PUT /reservaciones/{id} (backend real, no inventado). No
 * cubre cambiar cliente/tipo/origen/estado: eso sigue sin existir a
 * propósito (ver ReservacionService.actualizar en el backend).
 */
export function useActualizarReservacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReservacionUpdateInput }) =>
      reservacionesApi.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVACIONES_QUERY_KEY });
    },
  });
}

/**
 * Cubre tanto "cambiar estado" como "cancelar" — cancelar es
 * exactamente esta misma mutación con `nuevo_estado: "cancelada"`.
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
