import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descripcion: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  /** true mientras la acción confirmada está en curso (deshabilita botones) */
  cargando?: boolean;
  variante?: "default" | "destructive";
  onConfirmar: () => void;
}

/**
 * Confirmación reutilizada por cualquier acción destructiva o
 * irreversible en el sistema (desactivar cliente, cancelar
 * reservación, cerrar caja, etc.) — un solo componente, nunca un
 * `window.confirm()` ni un modal ad-hoc por pantalla.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  titulo,
  descripcion,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  cargando = false,
  variante = "default",
  onConfirmar,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={cargando}>
            {textoCancelar}
          </Button>
          <Button variant={variante === "destructive" ? "destructive" : "default"} onClick={onConfirmar} disabled={cargando}>
            {cargando ? "Procesando..." : textoConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
