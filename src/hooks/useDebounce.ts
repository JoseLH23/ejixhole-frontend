import * as React from "react";

export function useDebounce<T>(valor: T, delayMs = 300): T {
  const [debounced, setDebounced] = React.useState(valor);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(valor), delayMs);
    return () => window.clearTimeout(timeout);
  }, [valor, delayMs]);

  return debounced;
}
