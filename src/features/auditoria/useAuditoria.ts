import { useQuery } from "@tanstack/react-query";

import { auditoriaApi } from "@/api/auditoria";
import type { AuditEventFilters } from "@/types/auditEvent";

export function useAuditoria(filters: AuditEventFilters) {
  return useQuery({
    queryKey: ["auditoria", filters],
    queryFn: () => auditoriaApi.listar(filters),
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });
}
