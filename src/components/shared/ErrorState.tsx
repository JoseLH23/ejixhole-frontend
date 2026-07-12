import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getErrorInfo } from "@/lib/errors";

interface ErrorStateProps {
  titulo?: string;
  error: unknown;
  onRetry?: () => void;
  retrying?: boolean;
}

/** Mismo ajuste que EmptyState.tsx: tamaño por contenido, no h-[40vh]. */
export function ErrorState({ titulo, error, onRetry, retrying }: ErrorStateProps) {
  const info = getErrorInfo(error, titulo);

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-8 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <h3 className="text-sm font-medium">{titulo ?? info.title}</h3>
      <p className="max-w-sm text-xs text-muted-foreground">{info.description}</p>
      {onRetry && (
        <Button onClick={onRetry} disabled={retrying} size="sm">
          {retrying ? "Reintentando..." : "Reintentar"}
        </Button>
      )}
    </div>
  );
}
