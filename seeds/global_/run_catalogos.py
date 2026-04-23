# =============================================================
# Runner de seeds para catálogos globales de datos personales
# Idempotente: INSERT ... ON CONFLICT DO NOTHING
# Uso: python -m app.db.seeds.global_.run_catalogos
# =============================================================
from __future__ import annotations

import logging
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.seeds.global_.data_catalogos import (
    DEPARTAMENTOS_COLOMBIA,
    ETNIAS,
    MUNICIPIOS_COLOMBIA,
    NIVELES_EDUCATIVOS,
    NIVELES_ORGANIZACION_DATA,
    PAISES,
    TIPOS_DISCAPACIDAD,
    TIPOS_DOCUMENTO,
    TIPOS_ORGANIZACION_DATA,
    TIPOS_SANGRE,
    TIPOS_SEXO,
)
from app.db.seeds.global_.data_catalogos_deporte import (
    CARGOS_PERSONAL_DATA,
    CATEGORIAS_EDAD_DATA,
    UNIDADES_MEDIDA_DATA,
)
from app.db.seeds.global_.data_eps import EPS

log = logging.getLogger(__name__)


async def seed_paises(db: AsyncSession) -> None:
    for p in PAISES:
        await db.execute(
            text("""
                INSERT INTO public.paises
                    (codigo_iso2, codigo_iso3, codigo_num, nombre, nombre_corto, gentilicio, activo, orden)
                VALUES
                    (:codigo_iso2, :codigo_iso3, :codigo_num, :nombre, :nombre_corto, :gentilicio, :activo, :orden)
                ON CONFLICT (codigo_iso2) DO NOTHING
            """),
            p,
        )
    log.info("✅ Países: %d registros procesados", len(PAISES))


async def seed_departamentos(db: AsyncSession) -> None:
    # Obtener ID de Colombia
    result = await db.execute(
        text("SELECT id FROM public.paises WHERE codigo_iso2 = 'CO'")
    )
    co_id = result.scalar_one()

    for d in DEPARTAMENTOS_COLOMBIA:
        await db.execute(
            text("""
                INSERT INTO public.departamentos (pais_id, codigo_dane, nombre, activo)
                VALUES (:pais_id, :codigo_dane, :nombre, true)
                ON CONFLICT (codigo_dane) DO NOTHING
            """),
            {"pais_id": co_id, "codigo_dane": d["codigo_dane"], "nombre": d["nombre"]},
        )
    log.info(
        "✅ Departamentos Colombia: %d registros procesados",
        len(DEPARTAMENTOS_COLOMBIA),
    )


async def seed_municipios(db: AsyncSession) -> None:
    for codigo_dane_5, nombre, es_capital in MUNICIPIOS_COLOMBIA:
        codigo_dpto = codigo_dane_5[:2]  # Primeros 2 dígitos = código DANE dpto
        await db.execute(
            text("""
                INSERT INTO public.municipios (departamento_id, codigo_dane, nombre, es_capital, activo)
                SELECT d.id, :codigo_dane, :nombre, :es_capital, true
                FROM public.departamentos d
                WHERE d.codigo_dane = :codigo_dpto
                ON CONFLICT (codigo_dane) DO NOTHING
            """),
            {
                "codigo_dane": codigo_dane_5,
                "nombre": nombre,
                "es_capital": es_capital,
                "codigo_dpto": codigo_dpto,
            },
        )
    log.info(
        "✅ Municipios Colombia: %d registros procesados", len(MUNICIPIOS_COLOMBIA)
    )


async def seed_niveles_organizacion(db: AsyncSession) -> None:
    for n in NIVELES_ORGANIZACION_DATA:
        await db.execute(
            text("""
                INSERT INTO public.niveles_organizacion (nivel, nombre, activo)
                VALUES (:nivel, :nombre, :activo)
                ON CONFLICT (nivel) DO NOTHING
            """),
            n,
        )
    log.info(
        "Niveles organizacion: %d registros procesados",
        len(NIVELES_ORGANIZACION_DATA),
    )
async def seed_tipos_organizacion(db: AsyncSession) -> None:
    for t in TIPOS_ORGANIZACION_DATA:
        await db.execute(
            text("""
                INSERT INTO public.tipos_organizacion (nombre, nivel, activo)
                VALUES (:nombre, :nivel, :activo)
                ON CONFLICT (nombre) DO NOTHING
            """),
            t,
        )
    log.info(
        "✅ Tipos organización: %d registros procesados", len(TIPOS_ORGANIZACION_DATA)
    )


async def seed_tabla_simple(
    db: AsyncSession, tabla: str, datos: list[dict[str, Any]]
) -> None:
    """Inserta registros en tablas de catálogo simple usando el campo 'codigo' como clave única."""
    if not datos:
        return
    cols = list(datos[0].keys())
    placeholders = ", ".join(f":{c}" for c in cols)
    col_names = ", ".join(cols)
    for row in datos:
        await db.execute(
            text(f"""
                INSERT INTO public.{tabla} ({col_names})
                VALUES ({placeholders})
                ON CONFLICT (codigo) DO NOTHING
            """),
            row,
        )
    log.info("✅ %s: %d registros procesados", tabla, len(datos))


async def seed_eps(db: AsyncSession) -> None:
    """Inserta EPS colombianas. Requiere que paises ya este poblado."""
    result = await db.execute(
        text("SELECT id FROM public.paises WHERE codigo_iso2 = 'CO'")
    )
    co_id = result.scalar_one()

    for e in EPS:
        await db.execute(
            text("""
                INSERT INTO public.eps
                    (codigo, nit, nombre, regimen, activo, pais_id)
                VALUES
                    (:codigo, :nit, :nombre, :regimen, :activo, :pais_id)
                ON CONFLICT (codigo) DO NOTHING
            """),
            {**e, "pais_id": co_id},
        )
    log.info("✅ EPS: %d registros procesados", len(EPS))


async def seed_catalogos(db: AsyncSession) -> None:
    """Inserta todos los catálogos globales. Debe llamarse dentro de una transacción activa."""
    await seed_paises(db)
    await seed_departamentos(db)
    await seed_municipios(db)
    await seed_tabla_simple(db, "tipos_documento", TIPOS_DOCUMENTO)
    await seed_tabla_simple(db, "tipos_sexo", TIPOS_SEXO)
    await seed_tabla_simple(db, "tipos_sangre", TIPOS_SANGRE)
    await seed_tabla_simple(db, "niveles_educativos", NIVELES_EDUCATIVOS)
    await seed_tabla_simple(db, "etnias", ETNIAS)
    await seed_tabla_simple(db, "tipos_discapacidad", TIPOS_DISCAPACIDAD)
    await seed_eps(db)
    await seed_tabla_simple(db, "categorias_edad", CATEGORIAS_EDAD_DATA)
    await seed_tabla_simple(db, "cargos_personal", CARGOS_PERSONAL_DATA)
    await seed_tabla_simple(db, "unidades_medida", UNIDADES_MEDIDA_DATA)
    await seed_niveles_organizacion(db)
    await seed_tipos_organizacion(db)
