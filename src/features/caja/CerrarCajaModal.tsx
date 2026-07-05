import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useToast } from "@/components/ui/toast-provider";
import { useErrorToast } from "@/hooks/useErrorToast";
import { formatearMoneda } from "@/lib/format";
import type { CajaSesion } from "@/types/caja";
import { useCerrarCaja } from "./useCaja";

const cerrarCajaSchema = z.object({
  monto_cierre_real: z
    .string()
    .min(1, "El monto es obligatorio")
    .regex(/^\d+(\.\d{1,2})?$/, "Usa un formato como 500 o 500.00")
    .refine((v) => Number(v) >= 0, "El monto no puede ser negativo"),
});

type CerrarCajaFormValues = z.infer<typeof cerrarCajaSchema>;

interface CerrarCajaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sesion: CajaSesion;
}

/**
 * Cerrar una caja es irreversible — por eso, a diferencia de
 * "registrar movimiento", este flujo tiene un paso extra: al enviar
 * el formulario NO se cierra de inmediato, se muestra un
 * ConfirmDialog con la diferencia ya calculada (faltante/sobrante) y
 * solo al confirmar ahí se llama a la mutación real.
 */
export function CerrarCajaModal({ open, onOpenChange, sesion }: CerrarCajaModalProps) {
  const { toast } = useToast();
  const mostrarError = useErrorToast();
  const cerrar = useCerrarCaja();
  const [montoConfirmar, setMontoConfirmar] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CerrarCajaFormValues>({ resolver: zodResolver(cerrarCajaSchema) });

  React.useEffect(() => {
    if (open) {
      reset({ monto_cierre_real: "" });
      setMontoConfirmar(null);
    }
  }, [open, reset]);

  const onSubmitFormulario = (values: CerrarCajaFormValues) => {
    setMontoConfirmar(values.monto_cierre_real);
  };

  const diferencia =
    montoConfirmar !== null ? Number(montoConfirmar) - Number(sesion.saldo_actual) : 0;

  const confirmarCierre = () => {
    if (montoConfirmar === null) return;
    cerrar.mutate(
      { sesionId: sesion.id, data: { monto_cierre_real: montoConfirmar } },
      {
        onSuccess: () => {
          toast({ title: "Caja cerrada", variant: "success" });
          setMontoConfirmar(null);
          onOpenChange(false);
        },
        onError: (error) => {
          mostrarError(error, "No se pudo cerrar la caja");
          setMontoConfirmar(null);
        },
      }
    );
  };

  return (
    <>
      <Dialog open={open && montoConfirmar === null} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar caja</DialogTitle>
            <DialogDescription>
              Saldo esperado según el sistema: <strong>{formatearMoneda(sesion.saldo_actual)}</strong>.
              Cuenta el efectivo real y captúralo abajo.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmitFormulario)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="monto_cierre_real">Monto real contado (MXN) *</Label>
              <Input
                id="monto_cierre_real"
                inputMode="decimal"
                placeholder="0.00"
                {...register("monto_cierre_real")}
              />
              {errors.monto_cierre_real && (
                <p className="text-sm text-destructive">{errors.monto_cierre_real.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Continuar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={montoConfirmar !== null}
        onOpenChange={(abierto) => !abierto && setMontoConfirmar(null)}
        titulo="¿Confirmar cierre de caja?"
        descripcion={
          montoConfirmar !== null
            ? diferencia === 0
              ? `El monto contado coincide exactamente con lo esperado (${formatearMoneda(sesion.saldo_actual)}). Esta acción no se puede deshacer.`
              : diferencia > 0
                ? `Hay un SOBRANTE de ${formatearMoneda(String(diferencia))} respecto a lo esperado. Esta acción no se puede deshacer.`
                : `Hay un FALTANTE de ${formatearMoneda(String(Math.abs(diferencia)))} respecto a lo esperado. Esta acción no se puede deshacer.`
            : ""
        }
        textoConfirmar="Cerrar caja"
        variante={diferencia !== 0 ? "destructive" : "default"}
        cargando={cerrar.isPending}
        onConfirmar={confirmarCierre}
      />
    </>
  );
}
