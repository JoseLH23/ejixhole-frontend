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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-provider";
import { useErrorToast } from "@/hooks/useErrorToast";
import { useUsuarioIdTemporal } from "@/hooks/useUsuarioIdTemporal";
import { TIPOS_MOVIMIENTO } from "@/types/caja";
import { useRegistrarMovimiento } from "./useCaja";

const TIPO_LABELS: Record<string, string> = { ingreso: "Ingreso", egreso: "Egreso" };

const movimientoSchema = z.object({
  tipo: z.enum(TIPOS_MOVIMIENTO),
  monto: z
    .string()
    .min(1, "El monto es obligatorio")
    .regex(/^\d+(\.\d{1,2})?$/, "Usa un formato como 100 o 100.00")
    .refine((v) => Number(v) > 0, "El monto debe ser mayor a 0"),
  concepto: z.string().min(1, "El concepto es obligatorio"),
  usuario_id: z
    .string()
    .min(1, "Ingresa tu ID de usuario")
    .regex(/^\d+$/, "Debe ser un número entero"),
});

type MovimientoFormValues = z.infer<typeof movimientoSchema>;

interface RegistrarMovimientoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sesionId: number;
}

export function RegistrarMovimientoModal({ open, onOpenChange, sesionId }: RegistrarMovimientoModalProps) {
  const { toast } = useToast();
  const mostrarError = useErrorToast();
  const { usuarioId, setUsuarioId } = useUsuarioIdTemporal();
  const registrar = useRegistrarMovimiento();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<MovimientoFormValues>({
    resolver: zodResolver(movimientoSchema),
    defaultValues: { tipo: "ingreso" },
  });

  React.useEffect(() => {
    if (open) reset({ tipo: "ingreso", monto: "", concepto: "", usuario_id: usuarioId });
  }, [open, usuarioId, reset]);

  const onSubmit = (values: MovimientoFormValues) => {
    setUsuarioId(values.usuario_id);

    registrar.mutate(
      {
        sesionId,
        data: {
          usuario_id: Number(values.usuario_id),
          tipo: values.tipo,
          monto: values.monto,
          concepto: values.concepto,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Movimiento registrado", variant: "success" });
          onOpenChange(false);
        },
        onError: (error) => mostrarError(error, "No se pudo registrar el movimiento"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar movimiento</DialogTitle>
          <DialogDescription>Ingreso o egreso manual de esta sesión de caja.</DialogDescription>
        </DialogHeader>

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
                      {TIPOS_MOVIMIENTO.map((tipo) => (
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
              <Label htmlFor="monto">Monto (MXN) *</Label>
              <Input id="monto" inputMode="decimal" placeholder="100.00" {...register("monto")} />
              {errors.monto && <p className="text-sm text-destructive">{errors.monto.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="concepto">Concepto *</Label>
            <Input id="concepto" placeholder="Compra de material, propina, etc." {...register("concepto")} />
            {errors.concepto && <p className="text-sm text-destructive">{errors.concepto.message}</p>}
          </div>

          <div className="space-y-2 rounded-md border border-dashed p-3">
            <Label htmlFor="usuario_id">Tu ID de usuario (temporal) *</Label>
            <Input id="usuario_id" inputMode="numeric" {...register("usuario_id")} />
            {errors.usuario_id && <p className="text-sm text-destructive">{errors.usuario_id.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={registrar.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={registrar.isPending}>
              {registrar.isPending ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
