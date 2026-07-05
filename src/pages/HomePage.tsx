import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const SALUDO_POR_ROL: Record<string, string> = {
  admin: "Tienes acceso completo al sistema.",
  operador: "Puedes gestionar clientes, reservaciones y caja.",
  cajero: "Puedes registrar pagos y operar caja.",
};

export function HomePage() {
  const { usuario } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">
          Hola{usuario ? `, ${usuario.email}` : ""}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {usuario && SALUDO_POR_ROL[usuario.rol]}
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Dashboard en construcción</CardTitle>
          <CardDescription>
            Esta entrega solo cubre la infraestructura: login, navegación, permisos por rol y
            protección de rutas. Las tarjetas de KPIs de{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">/dashboard/resumen</code> llegan
            en la próxima entrega.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Mientras tanto, explora el menú lateral — cada sección ya respeta tu rol
          ({usuario?.rol}) exactamente igual que el backend.
        </CardContent>
      </Card>
    </div>
  );
}
