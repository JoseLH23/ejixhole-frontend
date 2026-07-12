import { useQuery } from "@tanstack/react-query";

import { unidadesHospedajeApi } from "@/api/unidadesHospedaje";

export function useUnidadesHospedaje() {
  return useQuery({
    queryKey: ["unidades-hospedaje"],
    queryFn: unidadesHospedajeApi.listar,
    staleTime: 5 * 60_000,
  });
}
