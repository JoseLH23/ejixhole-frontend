import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { reservacionesApi, type ListarReservacionesParams } from "@/api/reservaciones";
import { generarIdempotencyKey } from "@/lib/idempotencyKey";
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
  // AL-04: la MISMA key se reutiliza mientras dure este intento (así
  // un doble clic antes de que responda el servidor comparte la
  // misma clave — el backend lo dedupe de verdad). Se renueva al
  // terminar (éxito o error) para que el SIGUIENTE intento —ya sea
  // una reservación distinta, o un reintento con datos corregidos
  // tras un error de validación— no choque con la clave anterior.
  const idempotencyKeyRef = useRef(generarIdempotencyKey());

  return useMutation({
    mutationFn: (data: ReservacionCreateInput) => reservacionesApi.crear(data, idempotencyKeyRef.current),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVACIONES_QUERY_KEY });
      idempotencyKeyRef.current = generarIdempotencyKey();
    },
    onError: () => {
      idempotencyKeyRef.current = generarIdempotencyKey();
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
