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
import { useToast } from "@/components/ui/toast-provider";
import { useErrorToast } from "@/hooks/useErrorToast";
import { useClientes } from "@/features/clientes/useClientes";
import { useServicios } from "@/features/servicios/useServicios";
import { useUsuarioIdTemporal } from "@/hooks/useUsuarioIdTemporal";
import { formatearMoneda } from "@/lib/format";
import { ORIGENES_RESERVACION, TIPOS_RESERVACION, type Reservacion } from "@/types/reservacion";
import { useCrearReservacion, useActualizarReservacion } from "./useReservaciones";
import { useUnidadesHospedaje } from "./useUnidadesHospedaje";

const ORIGEN_LABELS: Record<string, string> = {
  recepcion: "Recepción",
  recepcion_express: "Recepción express",
  portal: "Portal",
  telefono: "Teléfono",
};

const TIPO_LABELS: Record<string, string> = {
  entrada: "Entrada (visita de un día)",
  camping: "Camping",
  hospedaje: "Hospedaje",
};

const reservacionSchema = z
  .object({
    cliente_id: z.string().min(1, "Selecciona un cliente"),
    servicio_id: z.string().min(1, "Selecciona un servicio"),
    usuario_id: z
      .string()
      .min(1, "Ingresa tu ID de usuario")
      .regex(/^\d+$/, "Debe ser un número entero"),
    tipo_reservacion: z.enum(TIPOS_RESERVACION),
    fecha_llegada: z.string().min(1, "Selecciona una fecha"),
    fecha_salida: z.string().min(1, "Selecciona una fecha"),
    unidad_hospedaje_id: z.string().optional(),
    num_personas: z
      .string()
      .min(1, "Obligatorio")
      .regex(/^\d+$/, "Debe ser un número entero")
      .refine((v) => Number(v) > 0, "Debe ser mayor a 0"),
    origen: z.enum(ORIGENES_RESERVACION),
    notas: z.string().optional(),
  })
  // Mismas reglas exactas que valida el backend (ver
  // app/schemas/reservacion.py: fechas_y_unidad_consistentes, y
  // ReservacionService.actualizar para edición) — se replican aquí
  // solo para dar feedback inmediato; el backend las vuelve a
  // exigir de todos modos, así que nunca queda una inconsistencia.
  .superRefine((data, ctx) => {
    if (data.fecha_salida < data.fecha_llegada) {
      ctx.addIssue({ code: "custom", path: ["fecha_salida"], message: "No puede ser anterior a la llegada" });
      return;
    }
    if (data.tipo_reservacion === "entrada" && data.fecha_salida !== data.fecha_llegada) {
      ctx.addIssue({
        code: "custom",
        path: ["fecha_salida"],
        message: "Para 'entrada' (un día), debe ser la misma fecha que la llegada",
      });
    }
    if (data.tipo_reservacion !== "entrada" && data.fecha_salida === data.fecha_llegada) {
      ctx.addIssue({
        code: "custom",
        path: ["fecha_salida"],
        message: "Se necesita al menos 1 noche (posterior a la llegada)",
      });
    }
    if (data.tipo_reservacion === "hospedaje" && !data.unidad_hospedaje_id) {
      ctx.addIssue({
        code: "custom",
        path: ["unidad_hospedaje_id"],
        message: "Selecciona una unidad de hospedaje",
      });
    }
  });

type ReservacionFormValues = z.infer<typeof reservacionSchema>;

interface ReservacionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Si viene una reservación, el modal edita; si es null, crea una nueva. */
  reservacionEditar?: Reservacion | null;
}

export function ReservacionFormModal({ open, onOpenChange, reservacionEditar = null }: ReservacionFormModalProps) {
  const { toast } = useToast();
  const mostrarError = useErrorToast();
  const crear = useCrearReservacion();
  const actualizar = useActualizarReservacion();
  const { usuarioId, setUsuarioId } = useUsuarioIdTemporal();
  const esEdicion = reservacionEditar !== null;
  const guardando = crear.isPending || actualizar.isPending;

  // Reutiliza los hooks que ya existen — no se crea ninguna llamada nueva.
  const { data: clientes } = useClientes({ solo_activos: true, limit: 200 });
  const { data: servicios } = useServicios({ solo_activos: true, limit: 200 });
  const { data: unidades } = useUnidadesHospedaje();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReservacionFormValues>({
    resolver: zodResolver(reservacionSchema),
    defaultValues: { origen: "recepcion", tipo_reservacion: "entrada" },
  });

  React.useEffect(() => {
    if (!open) return;
    if (reservacionEditar) {
      reset({
        cliente_id: String(reservacionEditar.cliente_id),
        servicio_id: String(reservacionEditar.servicio_id),
        usuario_id: usuarioId,
        tipo_reservacion: reservacionEditar.tipo_reservacion,
        fecha_llegada: reservacionEditar.fecha_llegada ?? reservacionEditar.fecha_visita,
        fecha_salida: reservacionEditar.fecha_salida ?? reservacionEditar.fecha_visita,
        unidad_hospedaje_id: reservacionEditar.unidad_hospedaje_id
          ? String(reservacionEditar.unidad_hospedaje_id)
          : "",
        num_personas: String(reservacionEditar.num_personas),
        origen: reservacionEditar.origen,
        notas: reservacionEditar.notas ?? "",
      });
    } else {
      reset({
        cliente_id: "",
        servicio_id: "",
        usuario_id: usuarioId,
        tipo_reservacion: "entrada",
        fecha_llegada: "",
        fecha_salida: "",
        unidad_hospedaje_id: "",
        num_personas: "",
        origen: "recepcion",
        notas: "",
      });
    }
  }, [open, reservacionEditar, usuarioId, reset]);

  const tipoSeleccionado = watch("tipo_reservacion");
  const fechaLlegadaActual = watch("fecha_llegada");
  const servicioSeleccionadoId = watch("servicio_id");
  const servicioSeleccionado = servicios?.find((s) => s.id === Number(servicioSeleccionadoId));

  // Para "entrada" la salida siempre es el mismo día — se sincroniza
  // sola para no pedirle al usuario un campo redundante.
  React.useEffect(() => {
    if (tipoSeleccionado === "entrada" && fechaLlegadaActual) {
      setValue("fecha_salida", fechaLlegadaActual);
    }
  }, [tipoSeleccionado, fechaLlegadaActual, setValue]);

  const onSubmit = (values: ReservacionFormValues) => {
    if (esEdicion && reservacionEditar) {
      actualizar.mutate(
        {
          id: reservacionEditar.id,
          data: {
            servicio_id: Number(values.servicio_id),
            fecha_llegada: values.fecha_llegada,
            fecha_salida: values.fecha_salida,
            num_personas: Number(values.num_personas),
            unidad_hospedaje_id: values.unidad_hospedaje_id ? Number(values.unidad_hospedaje_id) : undefined,
            notas: values.notas || undefined,
          },
        },
        {
          onSuccess: () => {
            toast({ title: "Reservación actualizada", variant: "success" });
            onOpenChange(false);
          },
          onError: (error) => mostrarError(error, "No se pudo actualizar la reservación"),
        }
      );
      return;
    }

    setUsuarioId(values.usuario_id);

    crear.mutate(
      {
        cliente_id: Number(values.cliente_id),
        servicio_id: Number(values.servicio_id),
        usuario_id: Number(values.usuario_id),
        tipo_reservacion: values.tipo_reservacion,
        fecha_llegada: values.fecha_llegada,
        fecha_salida: values.fecha_salida,
        unidad_hospedaje_id: values.unidad_hospedaje_id ? Number(values.unidad_hospedaje_id) : undefined,
        num_personas: Number(values.num_personas),
        origen: values.origen,
        notas: values.notas || undefined,
      },
      {
        onSuccess: () => {
          toast({ title: "Reservación creada", variant: "success" });
          onOpenChange(false);
        },
        onError: (error) => mostrarError(error, "No se pudo crear la reservación"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar reservación" : "Nueva reservación"}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? "El total se recalcula automáticamente con los nuevos datos."
              : "El total se calcula automáticamente según el servicio, fechas y personas."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Controller
              control={control}
              name="cliente_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={esEdicion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {[c.nombre, c.apellido].filter(Boolean).join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {esEdicion && (
              <p className="text-xs text-muted-foreground">El cliente no se puede cambiar al editar.</p>
            )}
            {errors.cliente_id && <p className="text-sm text-destructive">{errors.cliente_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Tipo de reservación *</Label>
            <Controller
              control={control}
              name="tipo_reservacion"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={esEdicion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_RESERVACION.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {TIPO_LABELS[tipo]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {esEdicion && (
              <p className="text-xs text-muted-foreground">
                El tipo no se puede cambiar al editar — cancela y crea una nueva si necesitas otro tipo.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Servicio *</Label>
            <Controller
              control={control}
              name="servicio_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicios?.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.nombre} — {formatearMoneda(s.precio)}
                        {s.capacidad_maxima ? ` (máx. ${s.capacidad_maxima})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.servicio_id && <p className="text-sm text-destructive">{errors.servicio_id.message}</p>}
            {servicioSeleccionado?.capacidad_maxima && (
              <p className="text-xs text-muted-foreground">
                Este servicio admite máximo {servicioSeleccionado.capacidad_maxima} personas por reservación.
              </p>
            )}
          </div>

          {tipoSeleccionado === "hospedaje" && (
            <div className="space-y-2">
              <Label>Unidad de hospedaje *</Label>
              <Controller
                control={control}
                name="unidad_hospedaje_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades?.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.nombre} — {formatearMoneda(u.precio_por_noche)}/noche (máx. {u.capacidad_maxima})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.unidad_hospedaje_id && (
                <p className="text-sm text-destructive">{errors.unidad_hospedaje_id.message}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_llegada">
                {tipoSeleccionado === "entrada" ? "Fecha de visita *" : "Llegada *"}
              </Label>
              <Input id="fecha_llegada" type="date" {...register("fecha_llegada")} />
              {errors.fecha_llegada && (
                <p className="text-sm text-destructive">{errors.fecha_llegada.message}</p>
              )}
            </div>
            {tipoSeleccionado !== "entrada" && (
              <div className="space-y-2">
                <Label htmlFor="fecha_salida">Salida *</Label>
                <Input id="fecha_salida" type="date" {...register("fecha_salida")} />
                {errors.fecha_salida && (
                  <p className="text-sm text-destructive">{errors.fecha_salida.message}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="num_personas">Número de personas *</Label>
              <Input id="num_personas" inputMode="numeric" {...register("num_personas")} />
              {errors.num_personas && (
                <p className="text-sm text-destructive">{errors.num_personas.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Origen</Label>
            <Controller
              control={control}
              name="origen"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={esEdicion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORIGENES_RESERVACION.map((origen) => (
                      <SelectItem key={origen} value={origen}>
                        {ORIGEN_LABELS[origen]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" rows={2} {...register("notas")} />
          </div>

          {!esEdicion && (
            <div className="space-y-2 rounded-md border border-dashed p-3">
              <Label htmlFor="usuario_id">Tu ID de usuario (temporal) *</Label>
              <Input id="usuario_id" inputMode="numeric" {...register("usuario_id")} />
              <p className="text-xs text-muted-foreground">
                El sistema todavía no toma esto automáticamente de tu sesión — pídeselo a un
                administrador si no lo conoces. Se recuerda en este navegador para la próxima vez.
              </p>
              {errors.usuario_id && <p className="text-sm text-destructive">{errors.usuario_id.message}</p>}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear reservación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
