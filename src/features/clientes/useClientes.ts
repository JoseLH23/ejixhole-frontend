import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { clientesApi, type ListarClientesParams } from "@/api/clientes";
import type { ClienteCreateInput, ClienteUpdateInput } from "@/types/cliente";

const CLIENTES_QUERY_KEY = ["clientes"] as const;

export function useClientes(params: ListarClientesParams = {}) {
  return useQuery({
    queryKey: [...CLIENTES_QUERY_KEY, params],
    queryFn: () => clientesApi.listar(params),
    staleTime: 30_000,
  });
}

export function useCrearCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ClienteCreateInput) => clientesApi.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTES_QUERY_KEY });
    },
  });
}

export function useActualizarCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClienteUpdateInput }) =>
      clientesApi.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTES_QUERY_KEY });
    },
  });
}

export function useDesactivarCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => clientesApi.desactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTES_QUERY_KEY });
    },
  });
}
