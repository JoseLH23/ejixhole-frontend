/**
 * Exportación genérica a CSV — un solo lugar, reutilizado por los 10
 * reportes. Cada página solo aporta sus propias filas ya cargadas
 * (los reportes ya traen datos reales del backend); esta función no
 * sabe nada de negocio, solo convierte arreglos de objetos a CSV real
 * y dispara la descarga en el navegador.
 */
function escaparCeldaCSV(valor: unknown): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  // Si contiene coma, comillas o salto de línea, hay que entrecomillar
  // y escapar comillas internas (regla estándar de CSV/RFC 4180).
  if (/[",\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

export function filasACSV(filas: Record<string, unknown>[]): string {
  if (filas.length === 0) return "";
  const columnas = Object.keys(filas[0]);
  const encabezado = columnas.map(escaparCeldaCSV).join(",");
  const cuerpo = filas.map((fila) => columnas.map((col) => escaparCeldaCSV(fila[col])).join(","));
  // \uFEFF (BOM) al inicio — sin esto, Excel en Windows muestra mal
  // los acentos/ñ de los reportes al abrir el CSV directo.
  return "\uFEFF" + [encabezado, ...cuerpo].join("\r\n");
}

export function descargarCSV(nombreArchivo: string, filas: Record<string, unknown>[]): void {
  const csv = filasACSV(filas);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo.endsWith(".csv") ? nombreArchivo : `${nombreArchivo}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);

  URL.revokeObjectURL(url);
}
