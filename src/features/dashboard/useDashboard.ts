import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "@/api/dashboard";

export function useDashboardResumen() {
  return useQuery({
    queryKey: ["dashboard", "resumen"],
    queryFn: dashboardApi.getResumen,
    // Los KPIs no necesitan ser "tiempo real" al segundo — 1 minuto de
    // cache evita refetches innecesarios si el usuario navega de ida y
    // vuelta al Dashboard.
    staleTime: 60_000,
  });
}
