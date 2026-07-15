export type TipoEventoCalendario = "bloqueo" | "mantenimiento" | "recordatorio" | "campana";

export interface EventoCalendarioLocal {
  id: string;
  titulo: string;
  tipo: TipoEventoCalendario;
  fechaInicio: string;
  fechaFin: string;
  notas?: string;
  creadoEn: string;
}

const VERSION = 1;

interface CalendarioPersistido {
  version: 1;
  eventos: EventoCalendarioLocal[];
}

function claveStorage(scope: string) {
  return `ejixhole:calendario-interno:${scope}`;
}

function esFechaValida(valor: unknown): valor is string {
  return typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor);
}

function esTipoValido(valor: unknown): valor is TipoEventoCalendario {
  return ["bloqueo", "mantenimiento", "recordatorio", "campana"].includes(String(valor));
}

function esEventoValido(valor: unknown): valor is EventoCalendarioLocal {
  if (!valor || typeof valor !== "object") return false;
  const evento = valor as Partial<EventoCalendarioLocal>;
  return (
    typeof evento.id === "string" &&
    typeof evento.titulo === "string" &&
    evento.titulo.trim().length > 0 &&
    esTipoValido(evento.tipo) &&
    esFechaValida(evento.fechaInicio) &&
    esFechaValida(evento.fechaFin) &&
    evento.fechaInicio <= evento.fechaFin &&
    typeof evento.creadoEn === "string" &&
    (evento.notas === undefined || typeof evento.notas === "string")
  );
}

export function cargarEventosCalendario(scope: string): EventoCalendarioLocal[] {
  try {
    const raw = localStorage.getItem(claveStorage(scope));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<CalendarioPersistido>;
    if (parsed.version !== VERSION || !Array.isArray(parsed.eventos)) return [];
    return parsed.eventos.filter(esEventoValido);
  } catch {
    return [];
  }
}

export function guardarEventosCalendario(scope: string, eventos: EventoCalendarioLocal[]) {
  const payload: CalendarioPersistido = { version: VERSION, eventos };
  try {
    localStorage.setItem(claveStorage(scope), JSON.stringify(payload));
  } catch {
    // El calendario continúa funcionando si el almacenamiento local no está disponible.
  }
}
