/**
 * Detección de plataforma — únicamente para mostrar el atajo de
 * teclado correcto en la UI ("Ctrl+K" en Windows/Linux, "⌘K" en Mac).
 * El listener real (CommandPalette.tsx) YA aceptaba `e.ctrlKey` además
 * de `e.metaKey` — el atajo funcionaba en Windows, el problema era
 * solo el texto mostrado, hardcodeado como "⌘K" en Sidebar y Topbar.
 */
export function esMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? navigator.userAgent);
}

export function etiquetaAtajoBuscar(): string {
  return esMac() ? "⌘K" : "Ctrl+K";
}
