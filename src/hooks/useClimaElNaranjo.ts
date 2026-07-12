import { useQuery } from "@tanstack/react-query";

// Coordenadas reales de la cabecera municipal de El Naranjo, S.L.P.
// (22°31' N, 99°19' O — INEGI / Wikipedia, verificado). No son las
// coordenadas exactas del parque (no publicadas), pero sí del
// municipio donde está EjiXhole — suficiente para un clima real de
// la zona en vez de un dato inventado.
const LAT = 22.52;
const LON = -99.33;

// Open-Meteo: API meteorológica pública, sin API key y sin costo
// (https://open-meteo.com) — no expone ningún secreto porque no
// requiere ninguno. Si en el futuro se prefiere un proveedor que sí
// requiera API key (OpenWeatherMap, etc.), ESO no se puede llamar
// directo desde el navegador sin exponer la key: necesitaría un
// endpoint propio en el backend que la oculte (ej. GET
// /clima/actual) — eso sí sería un endpoint nuevo, fuera de alcance
// de esta entrega.
const URL_OPEN_METEO = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&timezone=America%2FMexico_City`;

export interface ClimaActual {
  temperaturaC: number;
  codigoClima: number;
}

/**
 * Códigos WMO de Open-Meteo agrupados a lo que realmente necesitamos
 * mostrar (sol/nubes/lluvia/tormenta) — tabla completa en
 * https://open-meteo.com/en/docs
 */
export function descripcionClima(codigo: number): string {
  if (codigo === 0) return "Despejado";
  if (codigo <= 3) return "Parcialmente nublado";
  if (codigo <= 48) return "Neblina";
  if (codigo <= 57) return "Llovizna";
  if (codigo <= 67) return "Lluvia";
  if (codigo <= 77) return "Nieve";
  if (codigo <= 82) return "Chubascos";
  if (codigo <= 99) return "Tormenta";
  return "—";
}

async function obtenerClima(): Promise<ClimaActual> {
  const respuesta = await fetch(URL_OPEN_METEO);
  if (!respuesta.ok) throw new Error("No se pudo obtener el clima");
  const datos = await respuesta.json();
  return {
    temperaturaC: Math.round(datos.current.temperature_2m),
    codigoClima: datos.current.weather_code,
  };
}

/** Clima real de El Naranjo, S.L.P. — se refresca cada 15 minutos, sin API key. */
export function useClimaElNaranjo() {
  return useQuery({
    queryKey: ["clima-el-naranjo"],
    queryFn: obtenerClima,
    staleTime: 15 * 60_000,
    refetchInterval: 15 * 60_000,
    retry: 1,
  });
}
