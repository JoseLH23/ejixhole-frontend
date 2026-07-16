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
  const idempotencyKeyRef = useRef(generarIdempotencyKey());

  return useMutation({
    mutationFn: (data: PagoCreateInput) => pagosApi.crear(data, idempotencyKeyRef.current),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAGOS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RESERVACIONES_QUERY_KEY });
      // Un pago o reembolso en efectivo crea también un movimiento automático.
      queryClient.invalidateQueries({ queryKey: ["caja"] });
      idempotencyKeyRef.current = generarIdempotencyKey();
    },
  });
}
