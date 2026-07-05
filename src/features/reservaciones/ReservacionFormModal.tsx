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
import { useClientes } from "@/features/clientes/useClientes";
import { useServicios } from "@/features/servicios/useServicios";
import { useUsuarioIdTemporal } from "@/hooks/useUsuarioIdTemporal";
import { formatearMoneda } from "@/lib/format";
import { ORIGENES_RESERVACION } from "@/types/reservacion";
import { useCrearReservacion } from "./useReservaciones";

const ORIGEN_LABELS: Record<string, string> = {
  recepcion: "Recepción",
  recepcion_express: "Recepción express",
  portal: "Portal",
  telefono: "Teléfono",
};

const reservacionSchema = z.object({
  cliente_id: z.string().min(1, "Selecciona un cliente"),
  servicio_id: z.string().min(1, "Selecciona un servicio"),
  usuario_id: z
    .string()
    .min(1, "Ingresa tu ID de usuario")
    .regex(/^\d+$/, "Debe ser un número entero"),
  fecha_visita: z.string().min(1, "Selecciona una fecha"),
  num_personas: z
    .string()
    .min(1, "Obligatorio")
    .regex(/^\d+$/, "Debe ser un número entero")
    .refine((v) => Number(v) > 0, "Debe ser mayor a 0"),
  origen: z.enum(ORIGENES_RESERVACION),
  notas: z.string().optional(),
});

type ReservacionFormValues = z.infer<typeof reservacionSchema>;

interface ReservacionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReservacionFormModal({ open, onOpenChange }: ReservacionFormModalProps) {
  const { toast } = useToast();
  const crear = useCrearReservacion();
  const { usuarioId, setUsuarioId } = useUsuarioIdTemporal();

  // Reutiliza los hooks de Clientes/Servicios que ya existen — no se
  // crea ninguna llamada nueva a esas APIs, solo se consumen aquí.
  const { data: clientes } = useClientes({ solo_activos: true, limit: 200 });
  const { data: servicios } = useServicios({ solo_activos: true, limit: 200 });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<ReservacionFormValues>({
    resolver: zodResolver(reservacionSchema),
    defaultValues: { origen: "recepcion" },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        cliente_id: "",
        servicio_id: "",
        usuario_id: usuarioId,
        fecha_visita: "",
        num_personas: "",
        origen: "recepcion",
        notas: "",
      });
    }
  }, [open, usuarioId, reset]);

  const servicioSeleccionadoId = watch("servicio_id");
  const servicioSeleccionado = servicios?.find((s) => s.id === Number(servicioSeleccionadoId));

  const onSubmit = (values: ReservacionFormValues) => {
    // El usuario_id que funcionó se recuerda para la próxima vez —
    // ver docs/entrega-3c.md sobre esta limitación temporal.
    setUsuarioId(values.usuario_id);

    crear.mutate(
      {
        cliente_id: Number(values.cliente_id),
        servicio_id: Number(values.servicio_id),
        usuario_id: Number(values.usuario_id),
        fecha_visita: values.fecha_visita,
        num_personas: Number(values.num_personas),
        origen: values.origen,
        notas: values.notas || undefined,
      },
      {
        onSuccess: () => {
          toast({ title: "Reservación creada", variant: "success" });
          onOpenChange(false);
        },
        onError: (error: any) => {
          const detail = error?.response?.data?.detail;
          toast({
            title: "No se pudo crear la reservación",
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
          <DialogTitle>Nueva reservación</DialogTitle>
          <DialogDescription>
            El total se calcula automáticamente (precio del servicio × número de personas).
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Controller
              control={control}
              name="cliente_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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
            {errors.cliente_id && <p className="text-sm text-destructive">{errors.cliente_id.message}</p>}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_visita">Fecha de visita *</Label>
              <Input id="fecha_visita" type="date" {...register("fecha_visita")} />
              {errors.fecha_visita && (
                <p className="text-sm text-destructive">{errors.fecha_visita.message}</p>
              )}
            </div>
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
                <Select value={field.value} onValueChange={field.onChange}>
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

          <div className="space-y-2 rounded-md border border-dashed p-3">
            <Label htmlFor="usuario_id">Tu ID de usuario (temporal) *</Label>
            <Input id="usuario_id" inputMode="numeric" {...register("usuario_id")} />
            <p className="text-xs text-muted-foreground">
              El sistema todavía no toma esto automáticamente de tu sesión — pídeselo a un
              administrador si no lo conoces. Se recuerda en este navegador para la próxima vez.
            </p>
            {errors.usuario_id && <p className="text-sm text-destructive">{errors.usuario_id.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={crear.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={crear.isPending}>
              {crear.isPending ? "Creando..." : "Crear reservación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
