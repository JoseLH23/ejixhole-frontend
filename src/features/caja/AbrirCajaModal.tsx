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
import { useErrorToast } from "@/hooks/useErrorToast";
import { useAbrirCaja } from "./useCaja";

const abrirCajaSchema = z.object({
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
  const mostrarError = useErrorToast();
  const abrir = useAbrirCaja();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AbrirCajaFormValues>({ resolver: zodResolver(abrirCajaSchema) });

  React.useEffect(() => {
    if (open) reset({ monto_apertura: "" });
  }, [open, reset]);

  const onSubmit = (values: AbrirCajaFormValues) => {
    abrir.mutate(
      { monto_apertura: values.monto_apertura },
      {
        onSuccess: () => {
          toast({ title: "Caja abierta", variant: "success" });
          onOpenChange(false);
        },
        onError: (error) => mostrarError(error, "No se pudo abrir la caja"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir caja</DialogTitle>
          <DialogDescription>
            Se abrirá para tu usuario actual. No podrás abrir otra mientras siga activa.
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
