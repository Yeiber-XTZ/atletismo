# Checklist de requerimientos (vista pública) — Liga Atletismo Chocó

Fuente: `data/requirements_extracted.txt` (extraído del PDF).

## Módulos funcionales obligatorios (5.x)

- 5.1 Inicio institucional: `src/pages/index.astro` (se mantiene estructura Home; se ajustan CTAs/enlaces).
- 5.2 “Quiénes somos”: `src/pages/la-liga/index.astro`.
- 5.3 Clubes afiliados: `src/pages/clubes/index.astro` + ficha `src/pages/clubes/[slug].astro` (evitar links rotos).
- 5.4 Registro de usuarios: `src/pages/registro/index.astro` + subrutas `src/pages/registro/*` (evitar links rotos).
- 5.5 Convocatorias y postulaciones: `src/pages/convocatorias/index.astro` + detalle `src/pages/convocatorias/[slug].astro` (MVP público).
- 5.6 Competencias: `src/pages/competencias/index.astro` + detalle `src/pages/competencias/[slug].astro` (MVP público).
- 5.7 Calendario: `src/pages/calendario/index.astro`.
- 5.8 Resultados: `src/pages/resultados/index.astro`.
- 5.9 Ranking departamental: `src/pages/ranking/index.astro`.
- 5.10 Noticias y blog: `src/pages/noticias/index.astro` + detalle `src/pages/noticias/[slug].astro`; blog `src/pages/blog/*`.
- 5.11 Documental: `src/pages/documentos/index.astro` (nivel público MVP).
- 5.14 Contacto / PQRS: `src/pages/contacto/index.astro` + `src/pages/api/contacto.ts` (radicado + persistencia local MVP).

## Notas de alcance (MVP actual)

- Los módulos privados (asambleístas, órgano administrativo) quedan fuera del alcance público del MVP de vistas; existe `src/pages/admin/*` como panel inicial.
- La persistencia de formularios (PQRS/registro) se resuelve en archivos `data/*.json` cuando no hay DB; si se activa DB, se integra después con tablas.

