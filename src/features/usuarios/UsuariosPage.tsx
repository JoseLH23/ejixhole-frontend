import { UserCog, ShieldAlert } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Módulo Usuarios — BLOQUEADO por falta de endpoint real, no por falta
 * de tiempo de diseño.
 *
 * El backend expone únicamente:
 *   POST /auth/usuarios  (crear — requiere rol admin)
 * No existe ningún GET que liste usuarios (app/routes/auth_routes.py
 * es el único router de auth/usuarios del backend, confirmado — no
 * hay app/routes/usuario_routes.py). Tampoco existe GET /auth/me.
 *
 * Por instrucción explícita ("No inventes endpoints. Usa únicamente
 * lo que el backend ya expone.") esta pantalla NO simula una tabla de
 * usuarios con datos falsos. En vez de la pantalla genérica de
 * "Coming Soon" de antes, esta es una versión honesta y específica:
 * explica exactamente qué falta y qué sí es real.
 *
 * Para desbloquear el listado de verdad, el backend necesita agregar
 * (uno de estos, no ambos):
 *   GET /usuarios          -> lista de UsuarioOut (el schema ya existe)
 * y opcionalmente:
 *   GET /usuarios/{id}/ultimo-acceso  -> si se quiere "último acceso"
 *   (hoy el modelo Usuario no guarda ese dato en ningún lado)
 */
export function UsuariosPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        titulo="Usuarios"
        descripcion="Administración de cuentas del sistema."
        icon={UserCog}
        acento="wood"
      />

      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/12">
            <ShieldAlert className="h-6 w-6 text-warning" />
          </div>
          <h2 className="font-display text-lg font-semibold">El listado real todavía no es posible</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            El backend puede <strong>crear</strong> usuarios (<code className="text-xs">POST /auth/usuarios</code>,
            solo administradores), pero no expone ningún endpoint para <strong>listarlos</strong>. Sin ese endpoint,
            esta pantalla no puede mostrar una tabla real — y no se va a inventar una con datos falsos.
          </p>
          <div className="mt-1 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-left text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Para desbloquear este módulo se necesita:</p>
            <p className="mt-1">
              Agregar <code>GET /usuarios</code> al backend (el schema <code>UsuarioOut</code> ya existe en
              <code> app/schemas/auth.py</code> — solo falta la ruta). "Último acceso" necesitaría además guardar
              esa fecha en el modelo, que hoy no la tiene.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
