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
import { useCrearCliente, useActualizarCliente } from "./useClientes";
import type { Cliente } from "@/types/cliente";

const clienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellido: z.string().optional(),
  telefono: z.string().optional(),
  email: z.union([z.string().email("Email inválido"), z.literal("")]).optional(),
  notas: z.string().optional(),
});

type ClienteFormValues = z.infer<typeof clienteSchema>;

/** Convierte campos opcionales vacíos a `undefined` para que el backend los omita del todo,
 * en vez de guardar strings vacíos o (en edición) borrar un valor existente sin querer. */
function limpiar(values: ClienteFormValues) {
  return {
    nombre: values.nombre,
    apellido: values.apellido || undefined,
    telefono: values.telefono || undefined,
    email: values.email || undefined,
    notas: values.notas || undefined,
  };
}

interface ClienteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Si viene un cliente, el modal edita; si es null, crea uno nuevo. */
  clienteEditar: Cliente | null;
}

export function ClienteFormModal({ open, onOpenChange, clienteEditar }: ClienteFormModalProps) {
  const { toast } = useToast();
  const crear = useCrearCliente();
  const actualizar = useActualizarCliente();
  const esEdicion = clienteEditar !== null;
  const guardando = crear.isPending || actualizar.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
  });

  // Cada vez que se abre el modal (o cambia a qué cliente edita), se
  // rellena el formulario con sus datos actuales, o se limpia si es
  // un cliente nuevo.
  React.useEffect(() => {
    if (open) {
      reset({
        nombre: clienteEditar?.nombre ?? "",
        apellido: clienteEditar?.apellido ?? "",
        telefono: clienteEditar?.telefono ?? "",
        email: clienteEditar?.email ?? "",
        notas: clienteEditar?.notas ?? "",
      });
    }
  }, [open, clienteEditar, reset]);

  const onSubmit = async (values: ClienteFormValues) => {
    const datos = limpiar(values);

    if (esEdicion) {
      actualizar.mutate(
        { id: clienteEditar.id, data: datos },
        {
          onSuccess: () => {
            toast({ title: "Cliente actualizado", variant: "success" });
            onOpenChange(false);
          },
          onError: (error: any) => {
            const detail = error?.response?.data?.detail;
            toast({
              title: "No se pudo actualizar",
              description: typeof detail === "string" ? detail : "Intenta de nuevo.",
              variant: "error",
            });
          },
        }
      );
      return;
    }

    crear.mutate(datos, {
      onSuccess: (resultado) => {
        if (resultado.posibles_duplicados.length > 0) {
          const nombres = resultado.posibles_duplicados.map((c) => c.nombre).join(", ");
          toast({
            title: "Cliente creado — revisa posibles duplicados",
            description: `Coincide en teléfono o email con: ${nombres}.`,
            variant: "info",
          });
        } else {
          toast({ title: "Cliente creado", variant: "success" });
        }
        onOpenChange(false);
      },
      onError: () => {
        toast({
          title: "No se pudo crear el cliente",
          description: "Intenta de nuevo.",
          variant: "error",
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? "Actualiza los datos del cliente."
              : "Si el teléfono o email ya existen en otro cliente, se te avisará después de crearlo."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" {...register("nombre")} />
              {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" {...register("apellido")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" {...register("telefono")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" rows={3} {...register("notas")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
