/**
 * Tipos que reflejan app/schemas/auth.py del backend.
 *
 * Nota: cuando se genere el tipado completo desde /openapi.json (ver
 * docs/frontend/frontend-diseno.md sección 3), este archivo se
 * reemplaza por el generado automáticamente. Mientras tanto, se
 * escribe a mano y a propósito espejando los nombres de campo exactos
 * del backend para minimizar desincronización.
 */

export type Rol = "admin" | "operador" | "cajero";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

/** Payload decodificado del JWT (ver app/core/security.py: create_access_token) */
export interface JwtPayload {
  sub: string; // email del usuario
  rol: string;
  exp: number; // unix timestamp
}

export interface UsuarioActual {
  email: string;
  rol: Rol;
  /** Se llena de forma asíncrona vía GET /auth/me tras el login/restauración de sesión — puede no estar listo en el primer render. */
  nombre?: string;
}

/** Respuesta real de GET /auth/me (app/schemas/auth.py: UsuarioOut). */
export interface UsuarioMe {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
}
