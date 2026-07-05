import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Search, CornerDownLeft } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { NAV_ITEMS } from "@/router/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";

/**
 * Paleta de comandos global (⌘K / Ctrl+K) — inspirada en Raycast/Linear.
 * Reemplaza la caja de búsqueda que vivía embebida en el Topbar: ahora
 * la búsqueda es una capa flotante que se invoca desde cualquier
 * pantalla, no un widget más entre otros. Solo navega dentro del menú
 * ya filtrado por rol — no simula una búsqueda contra datos que el
 * backend no expone.
 */
interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = React.useState("");
  const [indiceActivo, setIndiceActivo] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const resultados = React.useMemo(() => {
    if (!usuario) return [];
    const texto = query.trim().toLowerCase();
    const disponibles = NAV_ITEMS.filter((item) => item.roles.includes(usuario.rol));
    if (!texto) return disponibles;
    return disponibles.filter((item) => item.label.toLowerCase().includes(texto));
  }, [query, usuario]);

  // Atajo global ⌘K / Ctrl+K para abrir/cerrar desde cualquier pantalla.
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setIndiceActivo(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  React.useEffect(() => setIndiceActivo(0), [query]);

  const irA = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ir a una sección..."
            className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIndiceActivo((i) => Math.min(i + 1, resultados.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIndiceActivo((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter" && resultados[indiceActivo]) {
                irA(resultados[indiceActivo].path);
              }
            }}
          />
          <kbd className="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {resultados.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">Sin resultados.</p>
          )}
          {resultados.map((item, i) => (
            <button
              key={item.path}
              onClick={() => irA(item.path)}
              onMouseEnter={() => setIndiceActivo(i)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                i === indiceActivo
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <item.icon className="h-4 w-4" />
                {item.label}
              </span>
              {i === indiceActivo && <CornerDownLeft className="h-3.5 w-3.5 opacity-70" />}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
