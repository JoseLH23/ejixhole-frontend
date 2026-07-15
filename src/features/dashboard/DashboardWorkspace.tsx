import * as React from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  RotateCcw,
  Settings2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

export interface DashboardWidget {
  id: string;
  titulo: string;
  contenido: React.ReactNode;
}

interface LayoutPersistido {
  version: 1;
  orden: string[];
  ocultos: string[];
}

interface DashboardWorkspaceProps {
  widgets: DashboardWidget[];
  storageScope: string;
}

const VERSION_LAYOUT = 1;

function claveStorage(scope: string) {
  return `ejixhole:control-center:${scope}`;
}

function cargarLayout(scope: string, idsDisponibles: string[]): LayoutPersistido {
  const base: LayoutPersistido = { version: VERSION_LAYOUT, orden: idsDisponibles, ocultos: [] };

  try {
    const raw = localStorage.getItem(claveStorage(scope));
    if (!raw) return base;

    const parsed = JSON.parse(raw) as Partial<LayoutPersistido>;
    if (parsed.version !== VERSION_LAYOUT || !Array.isArray(parsed.orden) || !Array.isArray(parsed.ocultos)) {
      localStorage.removeItem(claveStorage(scope));
      return base;
    }

    const idsValidos = new Set(idsDisponibles);
    const ordenValido = parsed.orden.filter((id) => idsValidos.has(id));
    const faltantes = idsDisponibles.filter((id) => !ordenValido.includes(id));
    const ocultosValidos = parsed.ocultos.filter((id) => idsValidos.has(id));

    return {
      version: VERSION_LAYOUT,
      orden: [...ordenValido, ...faltantes],
      ocultos: ocultosValidos,
    };
  } catch {
    return base;
  }
}

export function DashboardWorkspace({ widgets, storageScope }: DashboardWorkspaceProps) {
  const ids = React.useMemo(() => widgets.map((widget) => widget.id), [widgets]);
  const [editando, setEditando] = React.useState(false);
  const [arrastrando, setArrastrando] = React.useState<string | null>(null);
  const [layout, setLayout] = React.useState<LayoutPersistido>(() => cargarLayout(storageScope, ids));

  React.useEffect(() => {
    setLayout((actual) => {
      const idsValidos = new Set(ids);
      const ordenValido = actual.orden.filter((id) => idsValidos.has(id));
      const faltantes = ids.filter((id) => !ordenValido.includes(id));
      return {
        version: VERSION_LAYOUT,
        orden: [...ordenValido, ...faltantes],
        ocultos: actual.ocultos.filter((id) => idsValidos.has(id)),
      };
    });
  }, [ids]);

  React.useEffect(() => {
    try {
      localStorage.setItem(claveStorage(storageScope), JSON.stringify(layout));
    } catch {
      // El dashboard sigue funcionando aunque storage esté deshabilitado.
    }
  }, [layout, storageScope]);

  const porId = React.useMemo(() => new Map(widgets.map((widget) => [widget.id, widget])), [widgets]);
  const visibles = layout.orden.filter((id) => !layout.ocultos.includes(id)).map((id) => porId.get(id)).filter(Boolean) as DashboardWidget[];
  const ocultos = layout.orden.filter((id) => layout.ocultos.includes(id)).map((id) => porId.get(id)).filter(Boolean) as DashboardWidget[];

  function mover(id: string, delta: -1 | 1) {
    setLayout((actual) => {
      const orden = [...actual.orden];
      const desde = orden.indexOf(id);
      const hasta = desde + delta;
      if (desde < 0 || hasta < 0 || hasta >= orden.length) return actual;
      [orden[desde], orden[hasta]] = [orden[hasta], orden[desde]];
      return { ...actual, orden };
    });
  }

  function ocultar(id: string) {
    setLayout((actual) => ({ ...actual, ocultos: [...new Set([...actual.ocultos, id])] }));
  }

  function mostrar(id: string) {
    setLayout((actual) => ({ ...actual, ocultos: actual.ocultos.filter((item) => item !== id) }));
  }

  function restaurar() {
    setLayout({ version: VERSION_LAYOUT, orden: ids, ocultos: [] });
  }

  function soltar(sobreId: string) {
    if (!arrastrando || arrastrando === sobreId) return;
    setLayout((actual) => {
      const orden = actual.orden.filter((id) => id !== arrastrando);
      const indiceDestino = orden.indexOf(sobreId);
      orden.splice(indiceDestino, 0, arrastrando);
      return { ...actual, orden };
    });
    setArrastrando(null);
  }

  return (
    <section className="space-y-3" aria-label="Escritorio personalizable">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-foreground">EjiXhole Control Center</p>
          <p className="text-xs text-muted-foreground">
            {editando ? "Ordena, oculta o recupera widgets." : "Tu escritorio se guarda automáticamente en este dispositivo."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editando && (
            <button
              type="button"
              onClick={restaurar}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restaurar
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditando((valor) => !valor)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
              editando ? "bg-foreground text-background" : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {editando ? <X className="h-3.5 w-3.5" /> : <Settings2 className="h-3.5 w-3.5" />}
            {editando ? "Terminar" : "Personalizar"}
          </button>
        </div>
      </div>

      {editando && ocultos.length > 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Widgets ocultos</p>
          <div className="flex flex-wrap gap-2">
            {ocultos.map((widget) => (
              <button
                key={widget.id}
                type="button"
                onClick={() => mostrar(widget.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:border-primary/40"
              >
                <Eye className="h-3.5 w-3.5" />
                {widget.titulo}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {visibles.map((widget, indice) => (
          <div
            key={widget.id}
            draggable={editando}
            onDragStart={() => setArrastrando(widget.id)}
            onDragEnd={() => setArrastrando(null)}
            onDragOver={(event) => editando && event.preventDefault()}
            onDrop={() => soltar(widget.id)}
            className={cn(
              "relative rounded-2xl transition-all",
              editando && "border border-dashed border-primary/35 bg-primary/[0.02] p-2",
              arrastrando === widget.id && "opacity-50"
            )}
          >
            {editando && (
              <div className="mb-2 flex items-center justify-between rounded-lg bg-muted/70 px-2 py-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                  {widget.titulo}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => mover(widget.id, -1)}
                    disabled={indice === 0}
                    aria-label={`Subir ${widget.titulo}`}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-card hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(widget.id, 1)}
                    disabled={indice === visibles.length - 1}
                    aria-label={`Bajar ${widget.titulo}`}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-card hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => ocultar(widget.id)}
                    aria-label={`Ocultar ${widget.titulo}`}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-card hover:text-destructive"
                  >
                    <EyeOff className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            {widget.contenido}
          </div>
        ))}
      </div>
    </section>
  );
}
