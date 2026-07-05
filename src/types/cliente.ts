/** Tipos que reflejan app/schemas/cliente.py del backend. */

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string | null;
  telefono: string | null;
  email: string | null;
  notas: string | null;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ClienteCreateInput {
  nombre: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  notas?: string;
}

export type ClienteUpdateInput = Partial<ClienteCreateInput>;

export interface ClienteDuplicadoWarning {
  posibles_duplicados: Cliente[];
  cliente_creado: Cliente;
}
