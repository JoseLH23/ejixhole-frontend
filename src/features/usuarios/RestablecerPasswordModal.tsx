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
import { useRestablecerPasswordUsuario } from "./useUsuarios";
import type { Usuario } from "@/types/usuario";

const passwordSchema = z
  .object({
    nueva_password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(128, "La contraseña es demasiado larga"),
    confirmar_password: z.string().min(1, "Confirma la contraseña"),
  })
  .refine((values) => values.nueva_password === values.confirmar_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar_password"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface RestablecerPasswordModalProps {
  usuario: Usuario | null;
  onOpenChange: (open: boolean) => void;
}

export function RestablecerPasswordModal({
  usuario,
  onOpenChange,
}: RestablecerPasswordModalProps) {
  const { toast } = useToast();
  const mostrarError = useErrorToast();
  const restablecer = useRestablecerPasswordUsuario();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  React.useEffect(() => {
    if (usuario) {
      reset({ nueva_password: "", confirmar_password: "" });
    }
  }, [usuario, reset]);

  const onSubmit = (values: PasswordFormValues) => {
    if (!usuario) return;

    restablecer.mutate(
      {
        id: usuario.id,
        data: { nueva_password: values.nueva_password },
      },
      {
        onSuccess: () => {
          toast({
            title: "Contraseña restablecida",
            description: `${usuario.nombre} deberá usar la nueva contraseña en su próximo inicio de sesión.`,
            variant: "success",
          });
          onOpenChange(false);
        },
        onError: (error) => mostrarError(error, "No se pudo restablecer la contraseña"),
      }
    );
  };

  return (
    <Dialog open={usuario !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restablecer contraseña</DialogTitle>
          <DialogDescription>
            {usuario
              ? `Define una contraseña nueva para ${usuario.nombre}. No se mostrará después de guardarla.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="nueva_password">Nueva contraseña *</Label>
            <Input
              id="nueva_password"
              type="password"
              autoComplete="new-password"
              {...register("nueva_password")}
            />
            {errors.nueva_password && (
              <p className="text-sm text-destructive">{errors.nueva_password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmar_password">Confirmar contraseña *</Label>
            <Input
              id="confirmar_password"
              type="password"
              autoComplete="new-password"
              {...register("confirmar_password")}
            />
            {errors.confirmar_password && (
              <p className="text-sm text-destructive">{errors.confirmar_password.message}</p>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Usa al menos 8 caracteres. Comparte la contraseña por un medio seguro.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={restablecer.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={restablecer.isPending}>
              {restablecer.isPending ? "Guardando..." : "Restablecer contraseña"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
