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
import { useCrearUsuario, useRoles } from "./useUsuarios";

const ROL_LABEL: Record<string, string> = {
  admin: "Administrador",
  operador: "Operador",
  cajero: "Cajero",
};

const usuarioSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  rol_id: z.string().min(1, "Selecciona un rol"),
});

type UsuarioFormValues = z.infer<typeof usuarioSchema>;

interface UsuarioFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Solo crea. Editar rol y desactivar se manejan aparte, directo desde
 * la tabla (ver UsuariosPage.tsx / EditarRolModal.tsx).
 */
export function UsuarioFormModal({ open, onOpenChange }: UsuarioFormModalProps) {
  const { toast } = useToast();
  const mostrarError = useErrorToast();
  const crear = useCrearUsuario();
  const { data: roles } = useRoles();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UsuarioFormValues>({ resolver: zodResolver(usuarioSchema) });

  React.useEffect(() => {
    if (open) reset({ nombre: "", email: "", password: "", rol_id: "" });
  }, [open, reset]);

  const onSubmit = (values: UsuarioFormValues) => {
    crear.mutate(
      { nombre: values.nombre, email: values.email, password: values.password, rol_id: Number(values.rol_id) },
      {
        onSuccess: () => {
          toast({ title: "Usuario creado", variant: "success" });
          onOpenChange(false);
        },
        onError: (error) => mostrarError(error, "No se pudo crear el usuario"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
          <DialogDescription>Solo un administrador puede crear cuentas del sistema.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input id="nombre" {...register("nombre")} />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña *</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={crear.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={crear.isPending}>
              {crear.isPending ? "Creando..." : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
