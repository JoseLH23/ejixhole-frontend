export type AuditPayload = Record<string, unknown>;

export interface AuditEvent {
  id: number;
  actor_usuario_id: number | null;
  actor_nombre: string | null;
  actor_rol: string | null;
  accion: string;
  entidad_tipo: string;
  entidad_id: string | null;
  origen: string;
  request_id: string | null;
  antes: AuditPayload | null;
  despues: AuditPayload | null;
  contexto: AuditPayload | null;
  fecha_creacion: string;
}

export interface AuditEventFilters {
  entidad_tipo?: string;
  entidad_id?: string;
  accion?: string;
  actor_usuario_id?: number;
  desde?: string;
  hasta?: string;
  limit?: number;
  offset?: number;
}
