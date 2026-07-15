import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { pagosApi, type ListarPagosParams } from "@/api/pagos";
import { generarIdempotencyKey } from "@/lib/idempotencyKey";
import type { PagoCreateInput } from "@/types/pago";
import { RESERVACIONES_QUERY_KEY } from "@/features/reservaciones/useReservaciones";

const PAGOS_QUERY_KEY = ["pagos"] as const;

export function usePagos(params: ListarPagosParams = {}) {
  return useQuery({
    queryKey: [...PAGOS_QUERY_KEY, params],
    queryFn: () => pagosApi.listar(params),
    staleTime: 30_000,
  });
}

export function usePagosDeReservacion(reservacionId: number | null) {
  return useQuery({
    queryKey: [...PAGOS_QUERY_KEY, "reservacion", reservacionId],
    queryFn: () => pagosApi.listarPorReservacion(reservacionId as number),
    enabled: reservacionId !== null,
    staleTime: 10_000,
  });
}

export function useRegistrarPago() {
  const queryClient = useQueryClient();
  // AL-04: la key permanece estable hasta que el backend confirme éxito.
  // Ante timeout, pérdida de red o error 5xx no sabemos si el pago quedó
  // registrado; reutilizar la misma key permite recuperar el resultado
  // original y evita un cobro duplicado. El backend libera la key cuando
  // la operación falla realmente.
  const idempotencyKeyRef = useRef(generarIdempotencyKey());

  return useMutation({
    mutationFn: (data: PagoCreateInput) => pagosApi.crear(data, idempotencyKeyRef.current),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAGOS_QUERY_KEY });
      // Un pago cambia monto_pagado/saldo_pendiente/estado de la
      // reservación (lo calcula el backend) — hay que invalidar
      // también esa cache, no solo la de pagos.
      queryClient.invalidateQueries({ queryKey: RESERVACIONES_QUERY_KEY });
      idempotencyKeyRef.current = generarIdempotencyKey();
    },
    // No renovar en onError: el resultado puede ser incierto. El próximo
    // intento debe conservar la misma identidad para que el backend
    // deduplique o devuelva la respuesta ya guardada.
  });
}
