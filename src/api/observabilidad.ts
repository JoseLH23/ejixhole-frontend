import { apiClient } from "./client";
import type { BackendObservability, DiagnosticResult, EcosystemObservability, MhCoreObservability } from "@/types/observabilidad";

async function consultar<T>(ruta: string): Promise<DiagnosticResult<T>> {
  try {
    const respuesta = await apiClient.get<T>(ruta);
    return { ok: true, data: respuesta.data };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

export const observabilidadApi = {
  resumen: async (): Promise<EcosystemObservability> => {
    const [backend, mhCore] = await Promise.all([
      consultar<BackendObservability>("/observabilidad/resumen"),
      consultar<MhCoreObservability>("/dashboard/mh-core/observability"),
    ]);
    return { backend, mhCore, checkedAt: new Date().toISOString() };
  },
};
