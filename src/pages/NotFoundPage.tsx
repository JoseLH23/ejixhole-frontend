import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background text-center">
      <p className="font-display text-6xl font-semibold text-primary">404</p>
      <h1 className="text-xl font-semibold">Esta página no existe</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Revisa la dirección o vuelve al inicio.
      </p>
      <Button asChild>
        <Link to="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
