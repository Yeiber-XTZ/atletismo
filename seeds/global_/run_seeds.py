"""Runner de seed global (producción).

Propiedades:
- Idempotente a nivel BD (requiere constraints únicas).
- Seguro para re-ejecución: no muta DEPORTES_DATA.
- Transaccional: commit único o rollback total.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

import app.models.tenant  # noqa: F401
from app.db.seeds.global_.run_catalogos import seed_catalogos
from app.db.session import SessionLocal
from app.models.global_.deporte import Deporte, TipoDeporte
from app.models.global_.disciplina import Disciplina
from app.models.global_.prueba import GeneroAplicable, Prueba, UnidadResultado
from app.models.global_.prueba_config_deporte import PruebaConfigDeporte

from .data import DEPORTES_DATA
from .data_config_deporte import CONFIG_ATLETISMO

logger = logging.getLogger(__name__)


@dataclass
class SeedStats:
    deportes_insertados: int = 0
    disciplinas_insertadas: int = 0
    pruebas_insertadas: int = 0
    configs_insertadas: int = 0


def _to_deporte_payload(raw: dict) -> dict:
    return {
        **raw,
        "tipo": TipoDeporte(raw["tipo"]),
    }


def _to_prueba_payload(raw: dict, deporte_id: int, disciplina_id: int | None) -> dict:
    return {
        "deporte_id": deporte_id,
        "disciplina_id": disciplina_id,
        "nombre": raw["nombre"],
        "nombre_corto": raw.get("nombre_corto"),
        "genero_aplicable": GeneroAplicable(raw["genero"]),
        "unidad_resultado": UnidadResultado(raw["unidad"]),
        "es_relevos": raw.get("es_relevos", False),
        "es_prueba_conjunto": raw.get("es_prueba_conjunto", False),
        "descripcion": raw.get("descripcion"),
    }


async def _upsert_deporte(session: AsyncSession, datos_deporte: dict, stats: SeedStats) -> int:
    stmt = (
        insert(Deporte)
        .values(**_to_deporte_payload(datos_deporte))
        .on_conflict_do_nothing(index_elements=[Deporte.nombre])
        .returning(Deporte.id, Deporte.nombre)
    )
    result = await session.execute(stmt)
    row = result.fetchone()

    if row is not None:
        stats.deportes_insertados += 1
        logger.info("Deporte insertado: %s (id=%s)", row.nombre, row.id)
        return int(row.id)

    existing = await session.execute(
        select(Deporte.id).where(Deporte.nombre == datos_deporte["nombre"])
    )
    return int(existing.scalar_one())


async def _upsert_disciplinas(
    session: AsyncSession,
    deporte_id: int,
    datos_disciplinas: list[dict],
    stats: SeedStats,
) -> dict[str, int]:
    disc_map: dict[str, int] = {}

    for disc in datos_disciplinas:
        stmt = (
            insert(Disciplina)
            .values(deporte_id=deporte_id, **disc)
            .on_conflict_do_nothing(index_elements=[Disciplina.deporte_id, Disciplina.nombre])
            .returning(Disciplina.id, Disciplina.nombre)
        )
        result = await session.execute(stmt)
        row = result.fetchone()

        if row is not None:
            stats.disciplinas_insertadas += 1
            disc_map[row.nombre] = row.id
            continue

        existing = await session.execute(
            select(Disciplina.id).where(
                Disciplina.deporte_id == deporte_id,
                Disciplina.nombre == disc["nombre"],
            )
        )
        disc_map[disc["nombre"]] = existing.scalar_one()

    return disc_map


async def _upsert_pruebas(
    session: AsyncSession,
    deporte_id: int,
    disc_map: dict[str, int],
    datos_pruebas: list[dict],
    stats: SeedStats,
) -> None:
    for prueba in datos_pruebas:
        disciplina_nombre = prueba.get("disciplina")
        payload = _to_prueba_payload(
            raw=prueba,
            deporte_id=deporte_id,
            disciplina_id=disc_map.get(disciplina_nombre) if disciplina_nombre else None,
        )

        stmt = (
            insert(Prueba)
            .values(**payload)
            .on_conflict_do_nothing(index_elements=[Prueba.deporte_id, Prueba.nombre])
            .returning(Prueba.id)
        )
        result = await session.execute(stmt)
        if result.fetchone() is not None:
            stats.pruebas_insertadas += 1


async def seed_config_deporte(session: AsyncSession, stats: SeedStats) -> None:
    """Inserta configuracion ODF para pruebas de atletismo. Idempotente."""
    for entry in CONFIG_ATLETISMO:
        prueba_nombre = entry["prueba_nombre"]

        # Resolver prueba_id
        result = await session.execute(
            select(Prueba.id).where(Prueba.nombre == prueba_nombre)
        )
        prueba_id = result.scalar_one_or_none()
        if prueba_id is None:
            logger.warning("Prueba no encontrada para config: %s", prueba_nombre)
            continue

        stmt = (
            insert(PruebaConfigDeporte)
            .values(
                prueba_id=prueba_id,
                codigo_rsc=entry["codigo_rsc"],
                requiere_viento=entry["requiere_viento"],
                max_intentos=entry["max_intentos"],
                es_combinada_padre=entry["es_combinada_padre"],
                combinada_sub_pruebas=entry["combinada_sub_pruebas"],
                valor_minimo=entry["valor_minimo"],
                valor_maximo=entry["valor_maximo"],
                config_especifica=entry["config_especifica"],
            )
            .on_conflict_do_nothing(index_elements=[PruebaConfigDeporte.prueba_id])
        )
        result2 = await session.execute(stmt)
        if result2.rowcount:
            stats.configs_insertadas += 1
            logger.info("Config insertada: %s", prueba_nombre)


async def seed_deportes(session: AsyncSession) -> SeedStats:
    """Inserta catálogo global de deportes, disciplinas y pruebas."""
    stats = SeedStats()

    for entry in DEPORTES_DATA:
        deporte_id = await _upsert_deporte(session, entry["deporte"], stats)
        disc_map = await _upsert_disciplinas(session, deporte_id, entry["disciplinas"], stats)
        await _upsert_pruebas(session, deporte_id, disc_map, entry["pruebas"], stats)

    return stats


async def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    logger.info("Iniciando seed global...")

    async with SessionLocal() as session, session.begin():
        await seed_catalogos(session)
        stats = await seed_deportes(session)
        await seed_config_deporte(session, stats)

    logger.info(
        "Seed completado: %s deportes | %s disciplinas | %s pruebas | %s configs ODF insertadas.",
        stats.deportes_insertados,
        stats.disciplinas_insertadas,
        stats.pruebas_insertadas,
        stats.configs_insertadas,
    )


if __name__ == "__main__":
    asyncio.run(main())
