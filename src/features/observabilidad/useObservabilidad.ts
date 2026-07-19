import { useQuery } from "@tanstack/react-query";
import { observabilidadApi } from "@/api/observabilidad";

export function useObservabilidad() {
  return useQuery({
    queryKey: ["observabilidad"],
    queryFn: observabilidadApi.resumen,
    refetchInterval: 60000,
    staleTime: 30000,
    retry: false,
  });
}
