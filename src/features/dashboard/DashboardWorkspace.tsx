import * as React from "react";
import {
  ChevronDown,
  ChevronUp,
  EyeOff,
  GripVertical,
  LayoutGrid,
  Maximize2,
  Plus,
  RectangleHorizontal,
  RotateCcw,
  Settings2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type DashboardWidgetSize = "compacto" | "mediano" | "grande";

export interface DashboardWidget {
  id: string;
  titulo: string;
  descripcion?: string;
  categoria?: string;
  contenido: React.ReactNode;
  tamanosPermitidos?: DashboardWidgetSize[];
  tamanoInicial?: DashboardWidgetSize;
}

interface LayoutPersistido {
  version: 2;
  orden: string[];
  ocultos: string[];
  tamanos: Record<string, DashboardWidgetSize>;
}

interface DashboardWorkspaceProps {
  widgets: DashboardWidget[];
  storageScope: string;
}

const VERSION_LAYOUT = 2;
const TODOS_LOS_TAMANOS: DashboardWidgetSize[] = ["compacto", "mediano", "grande"];

const ETIQUETAS_TAMANO: Record<DashboardWidgetSize, string> = {
  compacto: "Pequeño",
  mediano: "Mediano",
  grande: "Grande",
};

const ICONOS_TAMANO = {
  compacto: RectangleHorizontal,
  mediano: LayoutGrid,
  grande: Maximize2,
};

function claveStorage(scope: string) {
  return `ejixhole:control-center:${scope}`;
}

function tamanosPermitidos(widget: DashboardWidget) {
  return widget.tamanosPermitidos?.length ? widget.tamanosPermitidos : TODOS_LOS_TAMANOS;
}

function tamanoPorDefecto(widget: DashboardWidget): DashboardWidgetSize {
  const permitidos = tamanosPermitidos(widget);
  return widget.tamanoInicial && permitidos.includes(widget.tamanoInicial) ? widget.tamanoInicial : permitidos[0];
}

function layoutBase(widgets: DashboardWidget[]): LayoutPersistido {
  return {
    version: VERSION_LAYOUT,
    orden: widgets.map((widget) => widget.id),
    ocultos: [],
    tamanos: Object.fromEntries(widgets.map((widget) => [widget.id, tamanoPorDefecto(widget)])),
  };
}

function normalizarLayout(layout: Partial<LayoutPersistido>, widgets: DashboardWidget[]): LayoutPersistido {
  const base = layoutBase(widgets);
  const porId = new Map(widgets.map((widget) => [widget.id, widget]));
  const idsValidos = new Set(porId.keys());
  const ordenRecibido = Array.isArray(layout.orden) ? layout.orden : [];
  const ordenValido = ordenRecibido.filter((id): id is string => typeof id === "string" && idsValidos.has(id));
  const faltantes = base.orden.filter((id) => !ordenValido.includes(id));
  const ocultosRecibidos = Array.isArray(layout.ocultos) ? layout.ocultos : [];
  const ocultos = ocultosRecibidos.filter((id): id is string => typeof id === "string" && idsValidos.has(id));
  const tamanosRecibidos = layout.tamanos && typeof layout.tamanos === "object" ? layout.tamanos : {};

  const tamanos = Object.fromEntries(
    widgets.map((widget) => {
      const guardado = tamanosRecibidos[widget.id];
      const permitidos = tamanosPermitidos(widget);
      return [widget.id, permitidos.includes(guardado) ? guardado : tamanoPorDefecto(widget)];
    })
  );

  return {
    version: VERSION_LAYOUT,
    orden: [...ordenValido, ...faltantes],
    ocultos,
    tamanos,
  };
}

function cargarLayout(scope: string, widgets: DashboardWidget[]): LayoutPersistido {
  const base = layoutBase(widgets);

  try {
    const raw = localStorage.getItem(claveStorage(scope));
    if (!raw) return base;

    const parsed = JSON.parse(raw) as Partial<LayoutPersistido> & { version?: number };

    // La versión 1 no guardaba tamaños. Se migra conservando orden y widgets ocultos.
    if (parsed.version === 1) {
      return normalizarLayout({ orden: parsed.orden, ocultos: parsed.ocultos, tamanos: {} }, widgets);
    }

    if (parsed.version !== VERSION_LAYOUT) {
      localStorage.removeItem(claveStorage(scope));
      return base;
    }

    return normalizarLayout(parsed, widgets);
  } catch {
    return base;
  }
}

function claseTamano(tamano: DashboardWidgetSize) {
  if (tamano === "compacto") return "lg:col-span-4";
  if (tamano === "mediano") return "lg:col-span-6";
  return "lg:col-span-12";
}

export function DashboardWorkspace({ widgets, storageScope }: DashboardWorkspaceProps) {
  const ids = React.useMemo(() => widgets.map((widget) => widget.id), [widgets]);
  const [editando, setEditando] = React.useState(false);
  const [catalogoAbierto, setCatalogoAbierto] = React.useState(false);
  const [arrastrando, setArrastrando] = React.useState<string | null>(null);
  const [layout, setLayout] = React.useState<LayoutPersistido>(() => cargarLayout(storageScope, widgets));

  React.useEffect(() => {
    setLayout((actual) => normalizarLayout(actual, widgets));
  }, [ids]);

  React.useEffect(() => {
    setLayout(cargarLayout(storageScope, widgets));
    setEditando(false);
    setCatalogoAbierto(false);
  }, [storageScope]);

  React.useEffect(() => {
    try {
      localStorage.setItem(claveStorage(storageScope), JSON.stringify(layout));
    } catch {
      // El dashboard sigue funcionando aunque storage esté deshabilitado.
    }
  }, [layout, storageScope]);

  const porId = React.useMemo(() => new Map(widgets.map((widget) => [widget.id, widget])), [widgets]);
  const visibles = layout.orden
    .filter((id) => !layout.ocultos.includes(id))
    .map((id) => porId.get(id))
    .filter(Boolean) as DashboardWidget[];
  const ocultos = layout.orden
    .filter((id) => layout.ocultos.includes(id))
    .map((id) => porId.get(id))
    .filter(Boolean) as DashboardWidget[];

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

  function cambiarTamano(id: string, tamano: DashboardWidgetSize) {
    const widget = porId.get(id);
    if (!widget || !tamanosPermitidos(widget).includes(tamano)) return;
    setLayout((actual) => ({ ...actual, tamanos: { ...actual.tamanos, [id]: tamano } }));
  }

  function restaurar() {
    setLayout(layoutBase(widgets));
    setCatalogoAbierto(false);
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
            {editando
              ? "Ordena, cambia el tamaño o administra tus widgets."
              : "Tu escritorio se guarda automáticamente en este dispositivo."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {editando && (
            <>
              <button
                type="button"
                onClick={() => setCatalogoAbierto((valor) => !valor)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  catalogoAbierto
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar widget
                {ocultos.length > 0 && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] leading-none text-primary-foreground">
                    {ocultos.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={restaurar}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restaurar
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setEditando((valor) => !valor);
              setCatalogoAbierto(false);
            }}
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

      {editando && catalogoAbierto && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Catálogo de widgets</p>
              <p className="text-xs text-muted-foreground">Agrega nuevamente los módulos que ocultaste.</p>
            </div>
            <button
              type="button"
              onClick={() => setCatalogoAbierto(false)}
              aria-label="Cerrar catálogo"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {ocultos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
              <LayoutGrid className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">Todos los widgets están visibles</p>
              <p className="text-xs text-muted-foreground">Oculta uno para poder agregarlo nuevamente desde aquí.</p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ocultos.map((widget) => (
                <button
                  key={widget.id}
                  type="button"
                  onClick={() => mostrar(widget.id)}
                  className="rounded-xl border border-border bg-background p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{widget.titulo}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {widget.descripcion || "Módulo del centro de control."}
                      </p>
                    </div>
                    <Plus className="h-4 w-4 shrink-0 text-primary" />
                  </div>
                  {widget.categoria && (
                    <span className="mt-3 inline-flex rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {widget.categoria}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {visibles.map((widget, indice) => {
          const tamano = layout.tamanos[widget.id] || tamanoPorDefecto(widget);
          const permitidos = tamanosPermitidos(widget);

          return (
            <div
              key={widget.id}
              draggable={editando}
              onDragStart={() => setArrastrando(widget.id)}
              onDragEnd={() => setArrastrando(null)}
              onDragOver={(event) => editando && event.preventDefault()}
              onDrop={() => soltar(widget.id)}
              className={cn(
                "relative min-w-0 rounded-2xl transition-all",
                claseTamano(tamano),
                editando && "border border-dashed border-primary/35 bg-primary/[0.02] p-2",
                arrastrando === widget.id && "opacity-50"
              )}
            >
              {editando && (
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/70 px-2 py-1.5">
                  <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-foreground">
                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                    <span className="truncate">{widget.titulo}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-1">
                    {permitidos.length > 1 &&
                      permitidos.map((opcion) => {
                        const Icon = ICONOS_TAMANO[opcion];
                        return (
                          <button
                            key={opcion}
                            type="button"
                            onClick={() => cambiarTamano(widget.id, opcion)}
                            aria-label={`${ETIQUETAS_TAMANO[opcion]} para ${widget.titulo}`}
                            aria-pressed={tamano === opcion}
                            title={ETIQUETAS_TAMANO[opcion]}
                            className={cn(
                              "rounded-md p-1.5 transition-colors",
                              tamano === opcion
                                ? "bg-card text-primary shadow-sm"
                                : "text-muted-foreground hover:bg-card hover:text-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </button>
                        );
                      })}
                    <span className="mx-0.5 h-5 w-px bg-border" />
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
          );
        })}
      </div>
    </section>
  );
}
