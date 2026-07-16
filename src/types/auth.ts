/** Tipos que reflejan app/schemas/auth.py del backend. */

export type Rol = "admin" | "operador" | "cajero";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface JwtPayload {
  sub: string;
  rol: string;
  exp: number;
}

export interface UsuarioActual {
  email: string;
  rol: Rol;
  /** Se completa vía GET /auth/me después del login o restauración. */
  id?: number;
  nombre?: string;
}

export interface UsuarioMe {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
}
