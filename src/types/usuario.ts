/** Tipos que reflejan app/schemas/auth.py del backend (UsuarioOut/RolOut, reutilizados por /usuarios). */

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  rol: string;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string | null;
}

/** POST /auth/usuarios — crear (admin-only, ya existía en el backend). */
export interface UsuarioCreateInput {
  nombre: string;
  email: string;
  password: string;
  rol_id: number;
}
