import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getErrorInfo } from "@/lib/errors";

interface ErrorStateProps {
  titulo?: string;
  error: unknown;
  onRetry?: () => void;
  retrying?: boolean;
}

export function ErrorState({ titulo, error, onRetry, retrying }: ErrorStateProps) {
  const info = getErrorInfo(error, titulo);

  return (
    <div className="flex h-[40vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <h3 className="font-medium">{titulo ?? info.title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{info.description}</p>
      {onRetry && (
        <Button onClick={onRetry} disabled={retrying}>
          {retrying ? "Reintentando..." : "Reintentar"}
        </Button>
      )}
    </div>
  );
}
