import * as React from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastData {
  id: string;
  title: string;
  description?: string;
  /** Alias temporal para llamadas existentes escritas en español. */
  descripcion?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (data: Omit<ToastData, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

const VARIANT_CONFIG: Record<ToastVariant, { Icon: typeof CheckCircle2; className: string }> = {
  success: { Icon: CheckCircle2, className: "border-success/30 bg-success/10 text-success" },
  error: { Icon: XCircle, className: "border-destructive/30 bg-destructive/10 text-destructive" },
  info: { Icon: Info, className: "border-border bg-card text-card-foreground" },
};

const DURACION_MS = 5000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((actuales) => actuales.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (data: Omit<ToastData, "id">) => {
      const id = crypto.randomUUID();
      const description = data.description ?? data.descripcion;
      setToasts((actuales) => [...actuales, { ...data, description, id }]);
      window.setTimeout(() => dismiss(id), DURACION_MS);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const { Icon, className } = VARIANT_CONFIG[t.variant];
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-bottom-2",
                className
              )}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description && <p className="mt-0.5 text-sm opacity-90">{t.description}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 rounded-sm opacity-60 hover:opacity-100"
                aria-label="Cerrar notificación"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }
  return context;
}
