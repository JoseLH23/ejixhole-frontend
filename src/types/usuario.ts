/** Tipos que reflejan app/schemas/auth.py del backend (UsuarioOut, reutilizado por GET /usuarios). */

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  rol: string;
}
