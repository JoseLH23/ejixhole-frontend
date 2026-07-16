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
  const idempotencyKeyRef = useRef(generarIdempotencyKey());

  return useMutation({
    mutationFn: (data: ReservacionCreateInput) => reservacionesApi.crear(data, idempotencyKeyRef.current),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVACIONES_QUERY_KEY });
      idempotencyKeyRef.current = generarIdempotencyKey();
    },
  });
}

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

export function useCheckInReservacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reservacionesApi.checkIn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVACIONES_QUERY_KEY });
    },
  });
}

export function useCheckOutReservacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reservacionesApi.checkOut(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVACIONES_QUERY_KEY });
    },
  });
}
