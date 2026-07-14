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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-provider";
import { useErrorToast } from "@/hooks/useErrorToast";
import { useActualizarRolUsuario, useRoles } from "./useUsuarios";
import type { Usuario } from "@/types/usuario";

const ROL_LABEL: Record<string, string> = {
  admin: "Administrador",
  operador: "Operador",
  cajero: "Cajero",
};

const rolSchema = z.object({
  rol_id: z.string().min(1, "Selecciona un rol"),
});

type RolFormValues = z.infer<typeof rolSchema>;

interface EditarRolModalProps {
  usuario: Usuario | null;
  onOpenChange: (open: boolean) => void;
}

export function EditarRolModal({ usuario, onOpenChange }: EditarRolModalProps) {
  const { toast } = useToast();
  const mostrarError = useErrorToast();
  const actualizarRol = useActualizarRolUsuario();
  const { data: roles } = useRoles();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RolFormValues>({ resolver: zodResolver(rolSchema) });

  React.useEffect(() => {
    if (usuario && roles) {
      const rolActual = roles.find((r) => r.nombre === usuario.rol);
      reset({ rol_id: rolActual ? String(rolActual.id) : "" });
    }
  }, [usuario, roles, reset]);

  const onSubmit = (values: RolFormValues) => {
    if (!usuario) return;
    actualizarRol.mutate(
      { id: usuario.id, data: { rol_id: Number(values.rol_id) } },
      {
        onSuccess: () => {
          toast({ title: "Rol actualizado", variant: "success" });
          onOpenChange(false);
        },
        onError: (error) => mostrarError(error, "No se pudo actualizar el rol"),
      }
    );
  };

  return (
    <Dialog open={usuario !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar rol</DialogTitle>
          <DialogDescription>
            {usuario ? `Cambiar el rol de ${usuario.nombre}.` : ""}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label>Rol *</Label>
            <Controller
              control={control}
              name="rol_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {ROL_LABEL[r.nombre] ?? r.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.rol_id && <p className="text-sm text-destructive">{errors.rol_id.message}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={actualizarRol.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={actualizarRol.isPending}>
              {actualizarRol.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
