import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { serviciosApi, type ListarServiciosParams } from "@/api/servicios";
import type { ServicioCreateInput, ServicioUpdateInput } from "@/types/servicio";

const SERVICIOS_QUERY_KEY = ["servicios"] as const;

export function useServicios(params: ListarServiciosParams = {}) {
  return useQuery({
    queryKey: [...SERVICIOS_QUERY_KEY, params],
    queryFn: () => serviciosApi.listar(params),
    staleTime: 30_000,
  });
}

export function useCrearServicio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ServicioCreateInput) => serviciosApi.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICIOS_QUERY_KEY });
    },
  });
}

export function useActualizarServicio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ServicioUpdateInput }) =>
      serviciosApi.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICIOS_QUERY_KEY });
    },
  });
}

export function useDesactivarServicio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviciosApi.desactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICIOS_QUERY_KEY });
    },
  });
}
