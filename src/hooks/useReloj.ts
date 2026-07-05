import * as React from "react";

/** Reloj en vivo, se refresca cada 30s (no necesitamos precisión de segundos). */
export function useReloj() {
  const [ahora, setAhora] = React.useState(new Date());

  React.useEffect(() => {
    const intervalo = setInterval(() => setAhora(new Date()), 30_000);
    return () => clearInterval(intervalo);
  }, []);

  return ahora;
}
