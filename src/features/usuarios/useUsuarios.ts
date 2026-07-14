import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { usuariosApi, type ListarUsuariosParams } from "@/api/usuarios";
import type { UsuarioCreateInput, UsuarioRolUpdateInput } from "@/types/usuario";

const USUARIOS_QUERY_KEY = ["usuarios"] as const;

export function useUsuarios(params: ListarUsuariosParams = {}) {
  return useQuery({
    queryKey: [...USUARIOS_QUERY_KEY, params],
    queryFn: () => usuariosApi.listar(params),
    staleTime: 60_000,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["usuarios", "roles"],
    queryFn: usuariosApi.roles,
    staleTime: 5 * 60_000,
  });
}

export function useCrearUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UsuarioCreateInput) => usuariosApi.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
    },
  });
}

export function useDesactivarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usuariosApi.desactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
    },
  });
}

export function useActualizarRolUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UsuarioRolUpdateInput }) =>
      usuariosApi.actualizarRol(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
    },
  });
}
