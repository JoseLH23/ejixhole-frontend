import * as React from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast-provider";
import { useErrorToast } from "@/hooks/useErrorToast";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatearMoneda } from "@/lib/format";
import { useUsuarioIdTemporal } from "@/hooks/useUsuarioIdTemporal";
import { METODOS_PAGO, TIPOS_PAGO } from "@/types/pago";
import type { Reservacion } from "@/types/reservacion";
import { usePagosDeReservacion, useRegistrarPago } from "./usePagos";

const TIPO_LABELS: Record<string, string> = {
  anticipo: "Anticipo",
  pago_completo: "Pago completo",
  pago_saldo: "Pago de saldo",
  reembolso: "Reembolso",
};

const METODO_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  otro: "Otro",
};

const pagoSchema = z.object({
  tipo: z.enum(TIPOS_PAGO),
  metodo_pago: z.enum(METODOS_PAGO),
  monto: z
    .string()
    .min(1, "El monto es obligatorio")
    .regex(/^\d+(\.\d{1,2})?$/, "Usa un formato como 500 o 500.00")
    .refine((v) => Number(v) > 0, "El monto debe ser mayor a 0"),
  referencia: z.string().optional(),
  notas: z.string().optional(),
  usuario_id: z
    .string()
    .min(1, "Ingresa tu ID de usuario")
    .regex(/^\d+$/, "Debe ser un número entero"),
});

type PagoFormValues = z.infer<typeof pagoSchema>;

interface PagoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservacionId: number;
  /**
   * Contexto opcional (saldo/total) para mostrar en el encabezado.
   * Solo se tiene cuando el modal se abre desde Reservaciones (donde
   * ya existe el objeto completo); desde /pagos con un ID escrito a
   * mano no hay forma de obtenerlo sin otra llamada — ver
   * docs/entrega-3d.md.
   */
  reservacionContexto?: Reservacion;
}

export function PagoModal({ open, onOpenChange, reservacionId, reservacionContexto }: PagoModalProps) {
  const { toast } = useToast();
  const mostrarError = useErrorToast();
  const { usuarioId, setUsuarioId } = useUsuarioIdTemporal();
  const historial = usePagosDeReservacion(open ? reservacionId : null);
  const registrar = useRegistrarPago();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema),
    defaultValues: { tipo: "anticipo", metodo_pago: "efectivo" },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        tipo: "anticipo",
        metodo_pago: "efectivo",
        monto: "",
        referencia: "",
        notas: "",
        usuario_id: usuarioId,
      });
    }
  }, [open, usuarioId, reset]);

  const onSubmit = (values: PagoFormValues) => {
    setUsuarioId(values.usuario_id);

    registrar.mutate(
      {
        reservacion_id: reservacionId,
        usuario_id: Number(values.usuario_id),
        monto: values.monto,
        tipo: values.tipo,
        metodo_pago: values.metodo_pago,
        referencia: values.referencia || undefined,
        notas: values.notas || undefined,
      },
      {
        onSuccess: () => {
          toast({ title: "Pago registrado", variant: "success" });
          reset({
            tipo: "anticipo",
            metodo_pago: "efectivo",
            monto: "",
            referencia: "",
            notas: "",
            usuario_id: values.usuario_id,
          });
        },
        onError: (error) => mostrarError(error, "No se pudo registrar el pago"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Pagos — Reservación #{reservacionId}</DialogTitle>
          <DialogDescription>
            {reservacionContexto ? (
              <>
                Saldo pendiente: <strong>{formatearMoneda(reservacionContexto.saldo_pendiente)}</strong> de{" "}
                {formatearMoneda(reservacionContexto.total)}
              </>
            ) : (
              "Historial y registro de pagos de esta reservación."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-48 overflow-y-auto rounded-md border">
          {historial.isLoading && (
            <p className="p-4 text-sm text-muted-foreground">Cargando historial...</p>
          )}
          {historial.isError && <ErrorState error={historial.error} titulo="No se pudo cargar el historial" />}
          {!historial.isLoading && !historial.isError && (historial.data?.length ?? 0) === 0 && (
            <EmptyState titulo="Sin pagos todavía" descripcion="Registra el primer pago abajo." />
          )}
          {!historial.isLoading && !historial.isError && (historial.data?.length ?? 0) > 0 && (
            <table className="w-full text-sm">
              <tbody>
                {historial.data!.map((pago) => (
                  <tr key={pago.id} className="border-b last:border-0">
                    <td className="p-2 font-mono">{formatearMoneda(pago.monto)}</td>
                    <td className="p-2">{TIPO_LABELS[pago.tipo]}</td>
                    <td className="p-2 text-muted-foreground">{METODO_LABELS[pago.metodo_pago]}</td>
                    <td className="p-2 text-xs text-muted-foreground">{pago.fecha_pago.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Separator />

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Controller
                control={control}
                name="tipo"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_PAGO.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {TIPO_LABELS[tipo]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Método *</Label>
              <Controller
                control={control}
                name="metodo_pago"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {METODOS_PAGO.map((metodo) => (
                        <SelectItem key={metodo} value={metodo}>
                          {METODO_LABELS[metodo]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto (MXN) *</Label>
              <Input id="monto" inputMode="decimal" placeholder="500.00" {...register("monto")} />
              {errors.monto && <p className="text-sm text-destructive">{errors.monto.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="referencia">Referencia</Label>
              <Input id="referencia" placeholder="Folio, autorización..." {...register("referencia")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" rows={2} {...register("notas")} />
          </div>

          <div className="space-y-2 rounded-md border border-dashed p-3">
            <Label htmlFor="usuario_id">Tu ID de usuario (temporal) *</Label>
            <Input id="usuario_id" inputMode="numeric" {...register("usuario_id")} />
            <p className="text-xs text-muted-foreground">
              Se recuerda en este navegador para la próxima vez. Ver nota en la documentación.
            </p>
            {errors.usuario_id && <p className="text-sm text-destructive">{errors.usuario_id.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            <Button type="submit" disabled={registrar.isPending}>
              {registrar.isPending ? "Registrando..." : "Registrar pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
