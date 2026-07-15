import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { eventosCalendarioApi } from "@/api/eventosCalendario";
import type { EventoCalendarioCreateInput } from "@/types/eventoCalendario";

const EVENTOS_CALENDARIO_QUERY_KEY = ["eventos-calendario"] as const;

export function useEventosCalendario(params: { desde?: string; hasta?: string } = {}) {
  return useQuery({
    queryKey: [...EVENTOS_CALENDARIO_QUERY_KEY, params],
    queryFn: () => eventosCalendarioApi.listar(params),
    staleTime: 30_000,
  });
}

export function useCrearEventoCalendario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EventoCalendarioCreateInput) => eventosCalendarioApi.crear(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENTOS_CALENDARIO_QUERY_KEY }),
  });
}

export function useEliminarEventoCalendario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eventosCalendarioApi.eliminar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENTOS_CALENDARIO_QUERY_KEY }),
  });
}
