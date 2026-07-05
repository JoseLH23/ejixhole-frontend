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
import { useToast } from "@/components/ui/toast-provider";
import { useUsuarioIdTemporal } from "@/hooks/useUsuarioIdTemporal";
import { useAbrirCaja } from "./useCaja";

const abrirCajaSchema = z.object({
  usuario_id: z
    .string()
    .min(1, "Ingresa tu ID de usuario")
    .regex(/^\d+$/, "Debe ser un número entero"),
  monto_apertura: z
    .string()
    .min(1, "El monto es obligatorio")
    .regex(/^\d+(\.\d{1,2})?$/, "Usa un formato como 500 o 500.00")
    .refine((v) => Number(v) >= 0, "El monto no puede ser negativo"),
});

type AbrirCajaFormValues = z.infer<typeof abrirCajaSchema>;

interface AbrirCajaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AbrirCajaModal({ open, onOpenChange }: AbrirCajaModalProps) {
  const { toast } = useToast();
  const { usuarioId, setUsuarioId } = useUsuarioIdTemporal();
  const abrir = useAbrirCaja();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AbrirCajaFormValues>({ resolver: zodResolver(abrirCajaSchema) });

  React.useEffect(() => {
    if (open) reset({ usuario_id: usuarioId, monto_apertura: "" });
  }, [open, usuarioId, reset]);

  const onSubmit = (values: AbrirCajaFormValues) => {
    setUsuarioId(values.usuario_id);

    abrir.mutate(
      { usuario_id: Number(values.usuario_id), monto_apertura: values.monto_apertura },
      {
        onSuccess: () => {
          toast({ title: "Caja abierta", variant: "success" });
          onOpenChange(false);
        },
        onError: (error: any) => {
          const detail = error?.response?.data?.detail;
          toast({
            title: "No se pudo abrir la caja",
            description: typeof detail === "string" ? detail : "Intenta de nuevo.",
            variant: "error",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir caja</DialogTitle>
          <DialogDescription>
            No podrás abrir otra mientras esta siga abierta.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="monto_apertura">Monto de apertura (MXN) *</Label>
            <Input id="monto_apertura" inputMode="decimal" placeholder="0.00" {...register("monto_apertura")} />
            {errors.monto_apertura && (
              <p className="text-sm text-destructive">{errors.monto_apertura.message}</p>
            )}
          </div>

          <div className="space-y-2 rounded-md border border-dashed p-3">
            <Label htmlFor="usuario_id">Tu ID de usuario (temporal) *</Label>
            <Input id="usuario_id" inputMode="numeric" {...register("usuario_id")} />
            <p className="text-xs text-muted-foreground">
              Se recuerda en este navegador para la próxima vez.
            </p>
            {errors.usuario_id && <p className="text-sm text-destructive">{errors.usuario_id.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={abrir.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={abrir.isPending}>
              {abrir.isPending ? "Abriendo..." : "Abrir caja"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
