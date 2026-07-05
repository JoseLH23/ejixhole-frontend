import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatearMoneda } from "@/lib/format";
import { useReservaciones } from "@/features/reservaciones/useReservaciones";

interface SeleccionarReservacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinuar: (reservacionId: number) => void;
}

/**
 * Antes de registrar un pago desde /pagos (sin venir ya de una fila de
 * Reservaciones) hay que saber a qué reservación aplica.
 *
 * LIMITACIÓN REAL: GET /reservaciones es admin+operador únicamente —
 * el rol `cajero` (que SÍ tiene acceso a Pagos) recibe 403 si se
 * intenta. Por eso este componente intenta mostrar un selector con
 * nombres, y si la consulta falla, cae a un campo de texto para
 * escribir el ID manualmente — nunca finge que el selector funciona
 * para un rol que no tiene ese acceso. Ver docs/entrega-3d.md.
 */
export function SeleccionarReservacionModal({
  open,
  onOpenChange,
  onContinuar,
}: SeleccionarReservacionModalProps) {
  const [idSeleccionado, setIdSeleccionado] = React.useState("");
  const { data: reservaciones, isLoading, isError } = useReservaciones({});

  React.useEffect(() => {
    if (open) setIdSeleccionado("");
  }, [open]);

  const activas = (reservaciones ?? []).filter(
    (r) => r.estado === "pendiente" || r.estado === "confirmada"
  );
  const puedeListar = !isError;

  const continuar = () => {
    const id = Number(idSeleccionado);
    if (id > 0) onContinuar(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿A qué reservación aplica el pago?</DialogTitle>
          <DialogDescription>
            {puedeListar
              ? "Selecciona la reservación activa."
              : "Tu rol no tiene acceso al listado de reservaciones — escribe el ID que te haya dado recepción."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">Cargando reservaciones...</p>}

          {!isLoading && puedeListar && (
            <>
              <Label>Reservación</Label>
              <Select value={idSeleccionado} onValueChange={setIdSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una reservación activa" />
                </SelectTrigger>
                <SelectContent>
                  {activas.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      #{r.id} — {r.fecha_visita} — saldo {formatearMoneda(r.saldo_pendiente)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activas.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No hay reservaciones activas. Si conoces el ID de una ya completada o cancelada
                  (ej. para registrar un reembolso), pídesela a un administrador.
                </p>
              )}
            </>
          )}

          {!isLoading && !puedeListar && (
            <>
              <Label htmlFor="reservacion_id_manual">ID de la reservación</Label>
              <Input
                id="reservacion_id_manual"
                inputMode="numeric"
                placeholder="Ej. 42"
                value={idSeleccionado}
                onChange={(e) => setIdSeleccionado(e.target.value)}
              />
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={continuar} disabled={!idSeleccionado || Number(idSeleccionado) <= 0}>
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
