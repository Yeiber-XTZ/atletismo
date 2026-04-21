# Coordinación (Codex ↔ Qwen) para trabajar en paralelo

Este repo usa un protocolo simple para que **dos asistentes (Codex y Qwen)** trabajen simultáneamente sin pisarse cambios.

## 1) Regla principal: “dueño de archivos”

Antes de empezar una tarea, define **qué archivos toca** y quién es el **dueño** de esos archivos.

- Si una tarea requiere editar archivos fuera de su dueño, primero coordinar el handoff (ver sección 4).

## 2) Lock ligero (rápido) en este mismo archivo

Cuando empieces una tarea, agrega una línea en **Locks activos** con:

- `quién` (Codex o Qwen)
- `tarea`
- `archivos/carpetas`
- `inicio` (fecha/hora local)

Cuando termines, borra tu lock.

### Locks activos

- (vacío)

## 3) Convención de ramas (si usan git)

- `codex/<tema-corto>` para cambios hechos por Codex
- `qwen/<tema-corto>` para cambios hechos por Qwen

Evita que ambos editen el mismo archivo en ramas distintas sin coordinación previa.

## 4) Handoff (cuando una tarea depende de la otra)

Si una tarea depende de otra en progreso:

1. El que necesita el cambio abre un comentario breve en el chat indicando dependencia.
2. El dueño del área confirma (o propone alternativa).
3. Se decide una de estas opciones:
   - **A)** El dueño implementa el cambio y avisa.
   - **B)** Se cede el lock y se transfiere el dueño temporalmente.
   - **C)** Se crea un archivo nuevo (menos conflicto) y luego el dueño integra.

## 5) Reglas para evitar conflictos típicos

- No tocar `package-lock.json` a la vez: si se modifica, avisar y coordinar.
- Si se necesita refactor grande, dividir por carpetas/componentes con dueño claro.
- Si se cambian estilos/tema, acordar una “fuente de verdad” (Tailwind config, tokens, etc.).

## 6) “Estado rápido” para el otro asistente (plantilla)

Copia/pega en el chat cuando avances:

- **Tarea:** …
- **Archivos tocados:** …
- **Pendiente/depende de:** …
- **Notas de integración:** …

