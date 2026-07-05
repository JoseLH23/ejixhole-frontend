import { useToast } from "@/components/ui/toast-provider";
import { getErrorInfo } from "@/lib/errors";

/**
 * `const mostrarError = useErrorToast(); ... onError: (e) => mostrarError(e)`
 * Reemplaza el patrón repetido en 12 archivos de:
 *   onError: (error: any) => {
 *     const detail = error?.response?.data?.detail;
 *     toast({ title: "...", description: ..., variant: "error" });
 *   }
 */
export function useErrorToast() {
  const { toast } = useToast();

  return (error: unknown, tituloPorDefecto?: string) => {
    const info = getErrorInfo(error, tituloPorDefecto);
    toast({ title: info.title, description: info.description, variant: "error" });
  };
}
