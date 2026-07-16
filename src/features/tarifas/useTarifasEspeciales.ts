import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tarifasEspecialesApi } from "@/api/tarifasEspeciales";
import type { SimulacionTarifaInput, TarifaEspecialInput } from "@/types/tarifaEspecial";

const KEY = ["tarifas-especiales"] as const;

export function useTarifasEspeciales() {
  return useQuery({ queryKey: KEY, queryFn: tarifasEspecialesApi.listar });
}

export function useSimularTarifaEspecial() {
  return useMutation({
    mutationFn: (data: SimulacionTarifaInput) => tarifasEspecialesApi.simular(data),
  });
}

export function useCrearTarifaEspecial() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: TarifaEspecialInput) => tarifasEspecialesApi.crear(data),
    onSuccess: () => client.invalidateQueries({ queryKey: KEY }),
  });
}

export function useActualizarTarifaEspecial() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TarifaEspecialInput> }) => tarifasEspecialesApi.actualizar(id, data),
    onSuccess: () => client.invalidateQueries({ queryKey: KEY }),
  });
}

export function useEliminarTarifaEspecial() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tarifasEspecialesApi.eliminar(id),
    onSuccess: () => client.invalidateQueries({ queryKey: KEY }),
  });
}
