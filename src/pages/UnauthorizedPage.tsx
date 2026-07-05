import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function UnauthorizedPage() {
  const { usuario } = useAuth();

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <ShieldAlert className="h-12 w-12 text-destructive" />
      <h1 className="font-display text-2xl font-semibold">No tienes acceso a esta sección</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Tu rol{usuario ? ` (${usuario.rol})` : ""} no tiene permiso para ver esta página. Si crees
        que es un error, contacta a un administrador.
      </p>
      <Button asChild>
        <Link to="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
