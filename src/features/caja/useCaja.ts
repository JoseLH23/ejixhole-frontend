import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cajaApi, type ListarCajaSesionesParams } from "@/api/caja";
import { generarIdempotencyKey } from "@/lib/idempotencyKey";
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
 * "Mi caja actual": se reutiliza GET /caja?usuario_id=X&estado=abierta.
 * La regla del backend garantiza como máximo una sesión abierta por usuario.
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
  const idempotencyKeyRef = useRef(generarIdempotencyKey());

  return useMutation({
    mutationFn: (data: CajaAbrirInput) => cajaApi.abrir(data, idempotencyKeyRef.current),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAJA_QUERY_KEY });
      idempotencyKeyRef.current = generarIdempotencyKey();
    },
    // Ante timeout o pérdida de red se conserva la misma clave: el backend
    // puede haber abierto la caja aunque la respuesta no haya llegado.
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
  const idempotencyKeyRef = useRef(generarIdempotencyKey());

  return useMutation({
    mutationFn: ({ sesionId, data }: { sesionId: number; data: CajaMovimientoCreateInput }) =>
      cajaApi.registrarMovimiento(sesionId, data, idempotencyKeyRef.current),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAJA_QUERY_KEY });
      idempotencyKeyRef.current = generarIdempotencyKey();
    },
    // No renovar en onError: un reintento incierto debe conservar identidad.
  });
}
