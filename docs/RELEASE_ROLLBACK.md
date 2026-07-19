# Release y rollback del panel

## Gate

- La etiqueta coincide con `release-manifest.json` y `package.json`.
- Tests, build, E2E y seguridad están verdes.
- El manifiesto central confirma compatibilidad con la API v1.
- El artefacto `dist` y sus hashes quedan adjuntos al release.

## Despliegue

El backend compatible se despliega antes que el panel. Después se ejecuta el smoke test manual con la URL HTTPS definitiva.

## Rollback

El panel puede volver al artefacto anterior cuando su API requerida siga disponible. Se conserva la etiqueta, commit, evidencia y resultado del smoke test. Si el backend retiró un contrato, primero se restaura compatibilidad del backend; no se oculta el fallo con cambios visuales.
