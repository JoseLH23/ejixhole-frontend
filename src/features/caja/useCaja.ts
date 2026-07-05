import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cajaApi, type ListarCajaSesionesParams } from "@/api/caja";
import type { CajaAbrirInput, CajaCerrarInput, CajaMovimientoCreateInput } from "@/types/caja";

const CAJA_QUERY_KEY = ["caja"] as const;

export function useCajaSesiones(params: ListarCajaSesionesParams = {}) {
  return useQuery({
    queryKey: [...CAJA_QUERY_KEY, "sesiones", params],
    queryFn: () => cajaApi.listarSesiones(params),
    staleTime: 30_000,
  });
}

/**
 * "Mi caja actual": no existe un endpoint dedicado — se reutiliza
 * GET /caja?usuario_id=X&estado=abierta (sí lo soporta el backend) y
 * se toma la primera coincidencia. Como la regla de negocio ya
 * garantiza como máximo una sesión abierta por usuario, esto es
 * exacto, no una aproximación.
 */
export function useCajaSesionActual(usuarioId: number | null) {
  const query = useQuery({
    queryKey: [...CAJA_QUERY_KEY, "actual", usuarioId],
    queryFn: () => cajaApi.listarSesiones({ usuario_id: usuarioId as number, estado: "abierta" }),
    enabled: usuarioId !== null,
    staleTime: 15_000,
  });

  return { ...query, sesionActual: query.data?.[0] ?? null };
}

export function useCajaMovimientos(sesionId: number | null) {
  return useQuery({
    queryKey: [...CAJA_QUERY_KEY, "movimientos", sesionId],
    queryFn: () => cajaApi.listarMovimientos(sesionId as number),
    enabled: sesionId !== null,
    staleTime: 10_000,
  });
}

export function useAbrirCaja() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CajaAbrirInput) => cajaApi.abrir(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAJA_QUERY_KEY });
    },
  });
}

export function useCerrarCaja() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sesionId, data }: { sesionId: number; data: CajaCerrarInput }) =>
      cajaApi.cerrar(sesionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAJA_QUERY_KEY });
    },
  });
}

export function useRegistrarMovimiento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sesionId, data }: { sesionId: number; data: CajaMovimientoCreateInput }) =>
      cajaApi.registrarMovimiento(sesionId, data),
    onSuccess: () => {
      // Un movimiento cambia saldo_actual de la sesión (lo calcula el
      // backend) además de agregarse a la lista de movimientos — hay
      // que invalidar toda la rama de caja, no solo "movimientos".
      queryClient.invalidateQueries({ queryKey: CAJA_QUERY_KEY });
    },
  });
}
