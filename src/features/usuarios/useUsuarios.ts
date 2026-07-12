import { useQuery } from "@tanstack/react-query";

import { usuariosApi, type ListarUsuariosParams } from "@/api/usuarios";

export function useUsuarios(params: ListarUsuariosParams = {}) {
  return useQuery({
    queryKey: ["usuarios", params],
    queryFn: () => usuariosApi.listar(params),
    staleTime: 60_000,
  });
}
