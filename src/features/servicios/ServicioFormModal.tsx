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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast-provider";
import { useErrorToast } from "@/hooks/useErrorToast";
import { useCrearServicio, useActualizarServicio } from "./useServicios";
import type { Servicio } from "@/types/servicio";

// Mismas reglas que app/schemas/servicio.py: precio >= 0,
// duracion_minutos y capacidad_maxima > 0 si se mandan.
const servicioSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
  precio: z
    .string()
    .min(1, "El precio es obligatorio")
    .regex(/^\d+(\.\d{1,2})?$/, "Usa un formato como 350 o 350.00")
    .refine((v) => Number(v) >= 0, "El precio no puede ser negativo"),
  duracion_minutos: z
    .string()
    .optional()
    .refine((v) => !v || (/^\d+$/.test(v) && Number(v) > 0), "Debe ser un número entero mayor a 0"),
  capacidad_maxima: z
    .string()
    .optional()
    .refine((v) => !v || (/^\d+$/.test(v) && Number(v) > 0), "Debe ser un número entero mayor a 0"),
  categoria: z.string().optional(),
});

type ServicioFormValues = z.infer<typeof servicioSchema>;

function limpiar(values: ServicioFormValues) {
  return {
    nombre: values.nombre,
    descripcion: values.descripcion || undefined,
    precio: values.precio,
    duracion_minutos: values.duracion_minutos ? Number(values.duracion_minutos) : undefined,
    capacidad_maxima: values.capacidad_maxima ? Number(values.capacidad_maxima) : undefined,
    categoria: values.categoria || undefined,
  };
}

interface ServicioFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Si viene un servicio, el modal edita; si es null, crea uno nuevo. */
  servicioEditar: Servicio | null;
}

export function ServicioFormModal({ open, onOpenChange, servicioEditar }: ServicioFormModalProps) {
  const { toast } = useToast();
  const mostrarError = useErrorToast();
  const crear = useCrearServicio();
  const actualizar = useActualizarServicio();
  const esEdicion = servicioEditar !== null;
  const guardando = crear.isPending || actualizar.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServicioFormValues>({
    resolver: zodResolver(servicioSchema),
  });

  React.useEffect(() => {
    if (open) {
      reset({
        nombre: servicioEditar?.nombre ?? "",
        descripcion: servicioEditar?.descripcion ?? "",
        precio: servicioEditar?.precio ?? "",
        duracion_minutos: servicioEditar?.duracion_minutos?.toString() ?? "",
        capacidad_maxima: servicioEditar?.capacidad_maxima?.toString() ?? "",
        categoria: servicioEditar?.categoria ?? "",
      });
    }
  }, [open, servicioEditar, reset]);

  const onSubmit = (values: ServicioFormValues) => {
    const datos = limpiar(values);

    if (esEdicion) {
      actualizar.mutate(
        { id: servicioEditar.id, data: datos },
        {
          onSuccess: () => {
            toast({ title: "Servicio actualizado", variant: "success" });
            onOpenChange(false);
          },
          onError: (error) => mostrarError(error, "No se pudo actualizar"),
        }
      );
      return;
    }

    crear.mutate(datos, {
      onSuccess: () => {
        toast({ title: "Servicio creado", variant: "success" });
        onOpenChange(false);
      },
      onError: (error) => mostrarError(error, "No se pudo crear el servicio"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? "Actualiza los datos del servicio."
              : "Define el catálogo de experiencias que se pueden reservar."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input id="nombre" {...register("nombre")} />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" rows={2} {...register("descripcion")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio (MXN) *</Label>
              <Input id="precio" inputMode="decimal" placeholder="350.00" {...register("precio")} />
              {errors.precio && <p className="text-sm text-destructive">{errors.precio.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Input id="categoria" placeholder="aventura, relax..." {...register("categoria")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duracion_minutos">Duración (minutos)</Label>
              <Input id="duracion_minutos" inputMode="numeric" {...register("duracion_minutos")} />
              {errors.duracion_minutos && (
                <p className="text-sm text-destructive">{errors.duracion_minutos.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacidad_maxima">Capacidad máxima (personas)</Label>
              <Input id="capacidad_maxima" inputMode="numeric" {...register("capacidad_maxima")} />
              {errors.capacidad_maxima && (
                <p className="text-sm text-destructive">{errors.capacidad_maxima.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear servicio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
