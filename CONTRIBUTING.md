# Contribuir a ejixhole-frontend

## Flujo obligatorio

1. Crear una rama desde `main`.
2. Mantener un objetivo principal por cambio.
3. Reutilizar el cliente HTTP, hooks y componentes existentes.
4. Añadir o actualizar pruebas.
5. Ejecutar pruebas y compilación.
6. Abrir un pull request usando la plantilla.
7. Verificar el preview antes de fusionar.

## Nombres de ramas

- `feat/...` para funciones.
- `fix/...` para correcciones.
- `security/...` para endurecimiento.
- `docs/...` para documentación.
- `cto/...` para bloques coordinados del roadmap.

## Reglas técnicas

- No almacenar tokens de sesión en JavaScript.
- No duplicar reglas de negocio que pertenecen al backend.
- No mostrar acciones que el rol actual no puede ejecutar.
- Toda operación crítica reintentable debe conservar su identidad hasta recibir éxito.
- Los contratos HTTP deben mantenerse alineados con la API versionada.
- Los componentes grandes deben dividirse cuando mezclen consulta, formulario, modal y presentación.

## Comandos mínimos

```powershell
npm ci
npm test
npm run build
```

La definición completa de terminado incluye pruebas, CI verde, manejo de errores, documentación, preview verificado y una forma de rollback cuando corresponda.
