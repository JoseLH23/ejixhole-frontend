import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  titulo?: string;
  error: unknown;
  onRetry?: () => void;
  retrying?: boolean;
}

/** Extrae el `detail` que el backend manda en sus errores (400/404/409/500). */
function mensajeDe(error: unknown): string {
  const detail = (error as any)?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  return "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.";
}

export function ErrorState({ titulo = "Algo salió mal", error, onRetry, retrying }: ErrorStateProps) {
  return (
    <div className="flex h-[40vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <h3 className="font-medium">{titulo}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{mensajeDe(error)}</p>
      {onRetry && (
        <Button onClick={onRetry} disabled={retrying}>
          {retrying ? "Reintentando..." : "Reintentar"}
        </Button>
      )}
    </div>
  );
}
