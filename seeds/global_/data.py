# =============================================================
# backend/app/db/seeds/global_/data.py
#
# Seed completo — 32 deportes olímpicos París 2024
# 48 disciplinas | ~329 pruebas/eventos
#
# Estructura de cada entrada:
# {
#   "deporte": { campos del modelo Deporte },
#   "disciplinas": [ {"nombre": "..."}, ... ],
#   "pruebas": [
#     {
#       "nombre":       str,        # nombre completo
#       "nombre_corto": str | None, # abreviatura para tablas
#       "disciplina":   str | None, # debe coincidir con nombre de disciplina arriba
#       "genero":       "MASCULINO" | "FEMENINO" | "MIXTO" | "TODOS",
#       "unidad":       "TIEMPO" | "DISTANCIA" | "PUNTOS" | "SETS" | "POSICION" | "N_A",
#       "es_relevos":         bool (default False),
#       "es_prueba_conjunto": bool (default False),
#     },
#     ...
#   ]
# }
#
# Ejecutar con:
#   python -m app.db.seeds.global_.run_seeds
# O como data migration en Alembic (recomendado para CI/CD)
# =============================================================

from __future__ import annotations

from typing import Any

DEPORTES_DATA: list[dict[str, Any]] = [

    # ════════════════════════════════════════════════════════
    # 1. ATLETISMO — 48 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Atletismo", "tipo": "INDIVIDUAL",
            "tiene_pruebas": True, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [
            {"nombre": "Pista"},
            {"nombre": "Campo"},
            {"nombre": "Marcha"},
            {"nombre": "Ruta"},
            {"nombre": "Combinadas"},
        ],
        "pruebas": [
            # ── Pista Masculino ──────────────────────────────
            {"nombre": "100m Plano Masculino",          "nombre_corto": "100m M",       "disciplina": "Pista",      "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "200m Plano Masculino",          "nombre_corto": "200m M",       "disciplina": "Pista",      "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "400m Plano Masculino",          "nombre_corto": "400m M",       "disciplina": "Pista",      "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "800m Masculino",                "nombre_corto": "800m M",       "disciplina": "Pista",      "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "1500m Masculino",               "nombre_corto": "1500m M",      "disciplina": "Pista",      "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "5000m Masculino",               "nombre_corto": "5000m M",      "disciplina": "Pista",      "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "10000m Masculino",              "nombre_corto": "10km M",       "disciplina": "Pista",      "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "110m Vallas Masculino",         "nombre_corto": "110mV M",      "disciplina": "Pista",      "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "400m Vallas Masculino",         "nombre_corto": "400mV M",      "disciplina": "Pista",      "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "3000m Obstáculos Masculino",    "nombre_corto": "3000Obs M",    "disciplina": "Pista",      "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "4x100m Relevos Masculino",      "nombre_corto": "4x100 M",      "disciplina": "Pista",      "genero": "MASCULINO", "unidad": "TIEMPO",    "es_relevos": True},
            {"nombre": "4x400m Relevos Masculino",      "nombre_corto": "4x400 M",      "disciplina": "Pista",      "genero": "MASCULINO", "unidad": "TIEMPO",    "es_relevos": True},
            # ── Campo Masculino ──────────────────────────────
            {"nombre": "Salto Alto Masculino",          "nombre_corto": "S.Alto M",     "disciplina": "Campo",      "genero": "MASCULINO", "unidad": "DISTANCIA"},
            {"nombre": "Salto con Garrocha Masculino",  "nombre_corto": "Garrocha M",   "disciplina": "Campo",      "genero": "MASCULINO", "unidad": "DISTANCIA"},
            {"nombre": "Salto Largo Masculino",         "nombre_corto": "S.Largo M",    "disciplina": "Campo",      "genero": "MASCULINO", "unidad": "DISTANCIA"},
            {"nombre": "Triple Salto Masculino",        "nombre_corto": "Triple M",     "disciplina": "Campo",      "genero": "MASCULINO", "unidad": "DISTANCIA"},
            {"nombre": "Lanzamiento Bala Masculino",    "nombre_corto": "Bala M",       "disciplina": "Campo",      "genero": "MASCULINO", "unidad": "DISTANCIA"},
            {"nombre": "Lanzamiento Disco Masculino",   "nombre_corto": "Disco M",      "disciplina": "Campo",      "genero": "MASCULINO", "unidad": "DISTANCIA"},
            {"nombre": "Lanzamiento Martillo Masculino","nombre_corto": "Martillo M",   "disciplina": "Campo",      "genero": "MASCULINO", "unidad": "DISTANCIA"},
            {"nombre": "Lanzamiento Jabalina Masculino","nombre_corto": "Jabalina M",   "disciplina": "Campo",      "genero": "MASCULINO", "unidad": "DISTANCIA"},
            # ── Combinadas / Marcha / Ruta Masculino ────────
            {"nombre": "Decatlón Masculino",            "nombre_corto": "Decatlón M",   "disciplina": "Combinadas", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Marcha 20km Masculino",         "nombre_corto": "Marcha20 M",   "disciplina": "Marcha",     "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Maratón Masculino",             "nombre_corto": "Maratón M",    "disciplina": "Ruta",       "genero": "MASCULINO", "unidad": "TIEMPO"},
            # ── Pista Femenino ───────────────────────────────
            {"nombre": "100m Plano Femenino",           "nombre_corto": "100m F",       "disciplina": "Pista",      "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "200m Plano Femenino",           "nombre_corto": "200m F",       "disciplina": "Pista",      "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "400m Plano Femenino",           "nombre_corto": "400m F",       "disciplina": "Pista",      "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "800m Femenino",                 "nombre_corto": "800m F",       "disciplina": "Pista",      "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "1500m Femenino",                "nombre_corto": "1500m F",      "disciplina": "Pista",      "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "5000m Femenino",                "nombre_corto": "5000m F",      "disciplina": "Pista",      "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "10000m Femenino",               "nombre_corto": "10km F",       "disciplina": "Pista",      "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "100m Vallas Femenino",          "nombre_corto": "100mV F",      "disciplina": "Pista",      "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "400m Vallas Femenino",          "nombre_corto": "400mV F",      "disciplina": "Pista",      "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "3000m Obstáculos Femenino",     "nombre_corto": "3000Obs F",    "disciplina": "Pista",      "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "4x100m Relevos Femenino",       "nombre_corto": "4x100 F",      "disciplina": "Pista",      "genero": "FEMENINO",  "unidad": "TIEMPO",    "es_relevos": True},
            {"nombre": "4x400m Relevos Femenino",       "nombre_corto": "4x400 F",      "disciplina": "Pista",      "genero": "FEMENINO",  "unidad": "TIEMPO",    "es_relevos": True},
            # ── Campo Femenino ───────────────────────────────
            {"nombre": "Salto Alto Femenino",           "nombre_corto": "S.Alto F",     "disciplina": "Campo",      "genero": "FEMENINO",  "unidad": "DISTANCIA"},
            {"nombre": "Salto con Garrocha Femenino",   "nombre_corto": "Garrocha F",   "disciplina": "Campo",      "genero": "FEMENINO",  "unidad": "DISTANCIA"},
            {"nombre": "Salto Largo Femenino",          "nombre_corto": "S.Largo F",    "disciplina": "Campo",      "genero": "FEMENINO",  "unidad": "DISTANCIA"},
            {"nombre": "Triple Salto Femenino",         "nombre_corto": "Triple F",     "disciplina": "Campo",      "genero": "FEMENINO",  "unidad": "DISTANCIA"},
            {"nombre": "Lanzamiento Bala Femenino",     "nombre_corto": "Bala F",       "disciplina": "Campo",      "genero": "FEMENINO",  "unidad": "DISTANCIA"},
            {"nombre": "Lanzamiento Disco Femenino",    "nombre_corto": "Disco F",      "disciplina": "Campo",      "genero": "FEMENINO",  "unidad": "DISTANCIA"},
            {"nombre": "Lanzamiento Martillo Femenino", "nombre_corto": "Martillo F",   "disciplina": "Campo",      "genero": "FEMENINO",  "unidad": "DISTANCIA"},
            {"nombre": "Lanzamiento Jabalina Femenino", "nombre_corto": "Jabalina F",   "disciplina": "Campo",      "genero": "FEMENINO",  "unidad": "DISTANCIA"},
            # ── Combinadas / Marcha / Ruta Femenino ─────────
            {"nombre": "Heptatlón Femenino",            "nombre_corto": "Heptatlón F",  "disciplina": "Combinadas", "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Marcha 20km Femenino",          "nombre_corto": "Marcha20 F",   "disciplina": "Marcha",     "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "Maratón Femenino",              "nombre_corto": "Maratón F",    "disciplina": "Ruta",       "genero": "FEMENINO",  "unidad": "TIEMPO"},
            # ── Mixtas ───────────────────────────────────────
            {"nombre": "4x400m Relevos Mixto",          "nombre_corto": "4x400 Mx",     "disciplina": "Pista",      "genero": "MIXTO",     "unidad": "TIEMPO",    "es_relevos": True},
            {"nombre": "Marcha Maratón Mixto",          "nombre_corto": "MaratónMx",    "disciplina": "Marcha",     "genero": "MIXTO",     "unidad": "TIEMPO"},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 2. NATACIÓN (ACUÁTICOS) — 49 eventos totales agrupados
    #    Swimming(35) + Artistic(2) + Diving(8) + MaratonSwim(2) + WaterPolo(2)
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Natación", "tipo": "INDIVIDUAL",
            "tiene_pruebas": True, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [
            {"nombre": "Piscina"},
            {"nombre": "Aguas Abiertas"},
            {"nombre": "Natación Artística"},
            {"nombre": "Clavados"},
            {"nombre": "Waterpolo"},
        ],
        "pruebas": [
            # ── Piscina — Libre Masculino ────────────────────
            {"nombre": "50m Libre Masculino",                        "nombre_corto": "50mL M",      "disciplina": "Piscina",            "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "100m Libre Masculino",                       "nombre_corto": "100mL M",     "disciplina": "Piscina",            "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "200m Libre Masculino",                       "nombre_corto": "200mL M",     "disciplina": "Piscina",            "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "400m Libre Masculino",                       "nombre_corto": "400mL M",     "disciplina": "Piscina",            "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "800m Libre Masculino",                       "nombre_corto": "800mL M",     "disciplina": "Piscina",            "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "1500m Libre Masculino",                      "nombre_corto": "1500mL M",    "disciplina": "Piscina",            "genero": "MASCULINO", "unidad": "TIEMPO"},
            # ── Piscina — Estilos Masculino ──────────────────
            {"nombre": "100m Espalda Masculino",                     "nombre_corto": "100mEsp M",   "disciplina": "Piscina",            "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "200m Espalda Masculino",                     "nombre_corto": "200mEsp M",   "disciplina": "Piscina",            "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "100m Braza Masculino",                       "nombre_corto": "100mBr M",    "disciplina": "Piscina",            "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "200m Braza Masculino",                       "nombre_corto": "200mBr M",    "disciplina": "Piscina",            "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "100m Mariposa Masculino",                    "nombre_corto": "100mMp M",    "disciplina": "Piscina",            "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "200m Mariposa Masculino",                    "nombre_corto": "200mMp M",    "disciplina": "Piscina",            "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "200m Estilos Individual Masculino",          "nombre_corto": "200mEI M",    "disciplina": "Piscina",            "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "400m Estilos Individual Masculino",          "nombre_corto": "400mEI M",    "disciplina": "Piscina",            "genero": "MASCULINO", "unidad": "TIEMPO"},
            # ── Piscina — Relevos Masculino ──────────────────
            {"nombre": "4x100m Libre Masculino",                     "nombre_corto": "4x100L M",    "disciplina": "Piscina",            "genero": "MASCULINO", "unidad": "TIEMPO", "es_relevos": True},
            {"nombre": "4x200m Libre Masculino",                     "nombre_corto": "4x200L M",    "disciplina": "Piscina",            "genero": "MASCULINO", "unidad": "TIEMPO", "es_relevos": True},
            {"nombre": "4x100m Estilos Masculino",                   "nombre_corto": "4x100E M",    "disciplina": "Piscina",            "genero": "MASCULINO", "unidad": "TIEMPO", "es_relevos": True},
            # ── Piscina — Libre Femenino ─────────────────────
            {"nombre": "50m Libre Femenino",                         "nombre_corto": "50mL F",      "disciplina": "Piscina",            "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "100m Libre Femenino",                        "nombre_corto": "100mL F",     "disciplina": "Piscina",            "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "200m Libre Femenino",                        "nombre_corto": "200mL F",     "disciplina": "Piscina",            "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "400m Libre Femenino",                        "nombre_corto": "400mL F",     "disciplina": "Piscina",            "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "800m Libre Femenino",                        "nombre_corto": "800mL F",     "disciplina": "Piscina",            "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "1500m Libre Femenino",                       "nombre_corto": "1500mL F",    "disciplina": "Piscina",            "genero": "FEMENINO",  "unidad": "TIEMPO"},
            # ── Piscina — Estilos Femenino ───────────────────
            {"nombre": "100m Espalda Femenino",                      "nombre_corto": "100mEsp F",   "disciplina": "Piscina",            "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "200m Espalda Femenino",                      "nombre_corto": "200mEsp F",   "disciplina": "Piscina",            "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "100m Braza Femenino",                        "nombre_corto": "100mBr F",    "disciplina": "Piscina",            "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "200m Braza Femenino",                        "nombre_corto": "200mBr F",    "disciplina": "Piscina",            "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "100m Mariposa Femenino",                     "nombre_corto": "100mMp F",    "disciplina": "Piscina",            "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "200m Mariposa Femenino",                     "nombre_corto": "200mMp F",    "disciplina": "Piscina",            "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "200m Estilos Individual Femenino",           "nombre_corto": "200mEI F",    "disciplina": "Piscina",            "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "400m Estilos Individual Femenino",           "nombre_corto": "400mEI F",    "disciplina": "Piscina",            "genero": "FEMENINO",  "unidad": "TIEMPO"},
            # ── Piscina — Relevos Femenino ───────────────────
            {"nombre": "4x100m Libre Femenino",                      "nombre_corto": "4x100L F",    "disciplina": "Piscina",            "genero": "FEMENINO",  "unidad": "TIEMPO", "es_relevos": True},
            {"nombre": "4x200m Libre Femenino",                      "nombre_corto": "4x200L F",    "disciplina": "Piscina",            "genero": "FEMENINO",  "unidad": "TIEMPO", "es_relevos": True},
            {"nombre": "4x100m Estilos Femenino",                    "nombre_corto": "4x100E F",    "disciplina": "Piscina",            "genero": "FEMENINO",  "unidad": "TIEMPO", "es_relevos": True},
            # ── Piscina — Relevos Mixtos ─────────────────────
            {"nombre": "4x100m Estilos Mixto",                       "nombre_corto": "4x100E Mx",   "disciplina": "Piscina",            "genero": "MIXTO",     "unidad": "TIEMPO", "es_relevos": True},
            # ── Aguas Abiertas ───────────────────────────────
            {"nombre": "10km Aguas Abiertas Masculino",              "nombre_corto": "10km AA M",   "disciplina": "Aguas Abiertas",     "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "10km Aguas Abiertas Femenino",               "nombre_corto": "10km AA F",   "disciplina": "Aguas Abiertas",     "genero": "FEMENINO",  "unidad": "TIEMPO"},
            # ── Natación Artística ───────────────────────────
            {"nombre": "Individual Natación Artística",              "nombre_corto": "NA Individual","disciplina": "Natación Artística", "genero": "TODOS",     "unidad": "PUNTOS"},
            {"nombre": "Dúo Natación Artística",                     "nombre_corto": "NA Dúo",      "disciplina": "Natación Artística", "genero": "TODOS",     "unidad": "PUNTOS"},
            # ── Clavados ────────────────────────────────────
            {"nombre": "Trampolín 3m Masculino",                     "nombre_corto": "Tramp3 M",    "disciplina": "Clavados",           "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Trampolín 3m Sincronizado Masculino",        "nombre_corto": "Tramp3Sinc M","disciplina": "Clavados",           "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Plataforma 10m Masculino",                   "nombre_corto": "Plat10 M",    "disciplina": "Clavados",           "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Plataforma 10m Sincronizado Masculino",      "nombre_corto": "Plat10Sinc M","disciplina": "Clavados",           "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Trampolín 3m Femenino",                      "nombre_corto": "Tramp3 F",    "disciplina": "Clavados",           "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Trampolín 3m Sincronizado Femenino",         "nombre_corto": "Tramp3Sinc F","disciplina": "Clavados",           "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Plataforma 10m Femenino",                    "nombre_corto": "Plat10 F",    "disciplina": "Clavados",           "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Plataforma 10m Sincronizado Femenino",       "nombre_corto": "Plat10Sinc F","disciplina": "Clavados",           "genero": "FEMENINO",  "unidad": "PUNTOS"},
            # ── Waterpolo ────────────────────────────────────
            {"nombre": "Waterpolo Masculino",                         "nombre_corto": "Waterpolo M", "disciplina": "Waterpolo",          "genero": "MASCULINO", "unidad": "N_A", "es_prueba_conjunto": True},
            {"nombre": "Waterpolo Femenino",                          "nombre_corto": "Waterpolo F", "disciplina": "Waterpolo",          "genero": "FEMENINO",  "unidad": "N_A", "es_prueba_conjunto": True},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 3. TIRO CON ARCO — 5 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Tiro con Arco", "tipo": "AMBOS",
            "tiene_pruebas": True, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Recurvo Individual Masculino",  "nombre_corto": "Arco Ind M",  "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Recurvo Individual Femenino",   "nombre_corto": "Arco Ind F",  "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Recurvo por Equipos Masculino", "nombre_corto": "Arco Eq M",   "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS", "es_prueba_conjunto": True},
            {"nombre": "Recurvo por Equipos Femenino",  "nombre_corto": "Arco Eq F",   "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS", "es_prueba_conjunto": True},
            {"nombre": "Recurvo por Equipos Mixto",     "nombre_corto": "Arco Eq Mx",  "disciplina": None, "genero": "MIXTO",     "unidad": "PUNTOS", "es_prueba_conjunto": True},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 4. BÁDMINTON — 5 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Bádminton", "tipo": "AMBOS",
            "tiene_pruebas": True, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Individual Masculino",          "nombre_corto": "Bádm Ind M",  "disciplina": None, "genero": "MASCULINO", "unidad": "SETS"},
            {"nombre": "Individual Femenino",           "nombre_corto": "Bádm Ind F",  "disciplina": None, "genero": "FEMENINO",  "unidad": "SETS"},
            {"nombre": "Dobles Masculino",              "nombre_corto": "Bádm Dob M",  "disciplina": None, "genero": "MASCULINO", "unidad": "SETS"},
            {"nombre": "Dobles Femenino",               "nombre_corto": "Bádm Dob F",  "disciplina": None, "genero": "FEMENINO",  "unidad": "SETS"},
            {"nombre": "Dobles Mixto",                  "nombre_corto": "Bádm Dob Mx", "disciplina": None, "genero": "MIXTO",     "unidad": "SETS"},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 5. BALONCESTO — 4 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Baloncesto", "tipo": "CONJUNTO",
            "tiene_pruebas": True, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [
            {"nombre": "5x5"},
            {"nombre": "3x3"},
        ],
        "pruebas": [
            {"nombre": "Baloncesto 5x5 Masculino",  "nombre_corto": "Baloncesto M",  "disciplina": "5x5", "genero": "MASCULINO", "unidad": "N_A", "es_prueba_conjunto": True},
            {"nombre": "Baloncesto 5x5 Femenino",   "nombre_corto": "Baloncesto F",  "disciplina": "5x5", "genero": "FEMENINO",  "unidad": "N_A", "es_prueba_conjunto": True},
            {"nombre": "Baloncesto 3x3 Masculino",  "nombre_corto": "3x3 M",         "disciplina": "3x3", "genero": "MASCULINO", "unidad": "N_A", "es_prueba_conjunto": True},
            {"nombre": "Baloncesto 3x3 Femenino",   "nombre_corto": "3x3 F",         "disciplina": "3x3", "genero": "FEMENINO",  "unidad": "N_A", "es_prueba_conjunto": True},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 6. BOXEO — 13 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Boxeo", "tipo": "INDIVIDUAL",
            "tiene_pruebas": True, "tiene_categoria": False,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Boxeo -51kg Masculino",      "nombre_corto": "-51kg M",    "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Boxeo -57kg Masculino",      "nombre_corto": "-57kg M",    "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Boxeo -63.5kg Masculino",    "nombre_corto": "-63.5kg M",  "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Boxeo -71kg Masculino",      "nombre_corto": "-71kg M",    "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Boxeo -80kg Masculino",      "nombre_corto": "-80kg M",    "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Boxeo -92kg Masculino",      "nombre_corto": "-92kg M",    "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Boxeo +92kg Masculino",      "nombre_corto": "+92kg M",    "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Boxeo -50kg Femenino",       "nombre_corto": "-50kg F",    "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Boxeo -54kg Femenino",       "nombre_corto": "-54kg F",    "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Boxeo -60kg Femenino",       "nombre_corto": "-60kg F",    "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Boxeo -66kg Femenino",       "nombre_corto": "-66kg F",    "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Boxeo -75kg Femenino",       "nombre_corto": "-75kg F",    "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Boxeo +75kg Femenino",       "nombre_corto": "+75kg F",    "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 7. BREAKING — 2 eventos (debut París 2024)
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Breaking", "tipo": "INDIVIDUAL",
            "tiene_pruebas": True, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Breaking B-Boys (Masculino)", "nombre_corto": "B-Boys",  "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Breaking B-Girls (Femenino)", "nombre_corto": "B-Girls", "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 8. CANOTAJE — 16 eventos (Slalom 6 + Sprint 10)
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Canotaje", "tipo": "AMBOS",
            "tiene_pruebas": True, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [
            {"nombre": "Slalom"},
            {"nombre": "Sprint"},
        ],
        "pruebas": [
            # ── Slalom ───────────────────────────────────────
            {"nombre": "Kayak K1 Slalom Masculino",         "nombre_corto": "K1 Slalom M",   "disciplina": "Slalom", "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Kayak K1 Slalom Femenino",          "nombre_corto": "K1 Slalom F",   "disciplina": "Slalom", "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "Canoa C1 Slalom Masculino",         "nombre_corto": "C1 Slalom M",   "disciplina": "Slalom", "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Canoa C1 Slalom Femenino",          "nombre_corto": "C1 Slalom F",   "disciplina": "Slalom", "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "Kayak Cross Masculino",             "nombre_corto": "KX M",          "disciplina": "Slalom", "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Kayak Cross Femenino",              "nombre_corto": "KX F",          "disciplina": "Slalom", "genero": "FEMENINO",  "unidad": "TIEMPO"},
            # ── Sprint ───────────────────────────────────────
            {"nombre": "Kayak K1 200m Masculino",           "nombre_corto": "K1 200m M",     "disciplina": "Sprint", "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Kayak K1 500m Femenino",            "nombre_corto": "K1 500m F",     "disciplina": "Sprint", "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "Kayak K2 500m Masculino",           "nombre_corto": "K2 500m M",     "disciplina": "Sprint", "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Kayak K2 500m Femenino",            "nombre_corto": "K2 500m F",     "disciplina": "Sprint", "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "Kayak K4 500m Masculino",           "nombre_corto": "K4 500m M",     "disciplina": "Sprint", "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Kayak K4 500m Femenino",            "nombre_corto": "K4 500m F",     "disciplina": "Sprint", "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "Canoa C1 1000m Masculino",          "nombre_corto": "C1 1000m M",    "disciplina": "Sprint", "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Canoa C2 500m Masculino",           "nombre_corto": "C2 500m M",     "disciplina": "Sprint", "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Canoa C2 500m Femenino",            "nombre_corto": "C2 500m F",     "disciplina": "Sprint", "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "Kayak K1 1000m Masculino",          "nombre_corto": "K1 1000m M",    "disciplina": "Sprint", "genero": "MASCULINO", "unidad": "TIEMPO"},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 9. CICLISMO — 22 eventos (BMXFree 2 + BMXRace 2 + MTB 2 + Ruta 4 + Pista 12)
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Ciclismo", "tipo": "AMBOS",
            "tiene_pruebas": True, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [
            {"nombre": "BMX Freestyle"},
            {"nombre": "BMX Racing"},
            {"nombre": "Mountain Bike"},
            {"nombre": "Ruta"},
            {"nombre": "Pista"},
        ],
        "pruebas": [
            # ── BMX Freestyle ────────────────────────────────
            {"nombre": "BMX Freestyle Masculino",           "nombre_corto": "BMXFree M",     "disciplina": "BMX Freestyle", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "BMX Freestyle Femenino",            "nombre_corto": "BMXFree F",     "disciplina": "BMX Freestyle", "genero": "FEMENINO",  "unidad": "PUNTOS"},
            # ── BMX Racing ───────────────────────────────────
            {"nombre": "BMX Racing Masculino",              "nombre_corto": "BMXRace M",     "disciplina": "BMX Racing",    "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "BMX Racing Femenino",               "nombre_corto": "BMXRace F",     "disciplina": "BMX Racing",    "genero": "FEMENINO",  "unidad": "TIEMPO"},
            # ── Mountain Bike ────────────────────────────────
            {"nombre": "Mountain Bike Cross-Country Masculino","nombre_corto": "MTB XC M",   "disciplina": "Mountain Bike", "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Mountain Bike Cross-Country Femenino", "nombre_corto": "MTB XC F",   "disciplina": "Mountain Bike", "genero": "FEMENINO",  "unidad": "TIEMPO"},
            # ── Ruta ─────────────────────────────────────────
            {"nombre": "Ruta Individual Masculino",         "nombre_corto": "Ruta M",        "disciplina": "Ruta",          "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Ruta Individual Femenino",          "nombre_corto": "Ruta F",        "disciplina": "Ruta",          "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "Contrarreloj Masculino",            "nombre_corto": "CRI M",         "disciplina": "Ruta",          "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Contrarreloj Femenino",             "nombre_corto": "CRI F",         "disciplina": "Ruta",          "genero": "FEMENINO",  "unidad": "TIEMPO"},
            # ── Pista ────────────────────────────────────────
            {"nombre": "Velocidad Individual Masculino",    "nombre_corto": "Veloc M",       "disciplina": "Pista",         "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Velocidad Individual Femenino",     "nombre_corto": "Veloc F",       "disciplina": "Pista",         "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "Keirin Masculino",                  "nombre_corto": "Keirin M",      "disciplina": "Pista",         "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Keirin Femenino",                   "nombre_corto": "Keirin F",      "disciplina": "Pista",         "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "Omnium Masculino",                  "nombre_corto": "Omnium M",      "disciplina": "Pista",         "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Omnium Femenino",                   "nombre_corto": "Omnium F",      "disciplina": "Pista",         "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Madison Masculino",                 "nombre_corto": "Madison M",     "disciplina": "Pista",         "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Madison Femenino",                  "nombre_corto": "Madison F",     "disciplina": "Pista",         "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Persecución por Equipos Masculino","nombre_corto": "Persec Eq M",   "disciplina": "Pista",         "genero": "MASCULINO", "unidad": "TIEMPO", "es_prueba_conjunto": True},
            {"nombre": "Persecución por Equipos Femenino", "nombre_corto": "Persec Eq F",   "disciplina": "Pista",         "genero": "FEMENINO",  "unidad": "TIEMPO", "es_prueba_conjunto": True},
            {"nombre": "Velocidad por Equipos Masculino",  "nombre_corto": "Veloc Eq M",    "disciplina": "Pista",         "genero": "MASCULINO", "unidad": "TIEMPO", "es_prueba_conjunto": True},
            {"nombre": "Velocidad por Equipos Femenino",   "nombre_corto": "Veloc Eq F",    "disciplina": "Pista",         "genero": "FEMENINO",  "unidad": "TIEMPO", "es_prueba_conjunto": True},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 10. ECUESTRE — 6 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Ecuestre", "tipo": "AMBOS",
            "tiene_pruebas": True, "tiene_categoria": False,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [
            {"nombre": "Dressage"},
            {"nombre": "Eventing"},
            {"nombre": "Salto"},
        ],
        "pruebas": [
            {"nombre": "Dressage Individual",           "nombre_corto": "Dressage Ind",  "disciplina": "Dressage",  "genero": "TODOS", "unidad": "PUNTOS"},
            {"nombre": "Dressage por Equipos",          "nombre_corto": "Dressage Eq",   "disciplina": "Dressage",  "genero": "TODOS", "unidad": "PUNTOS", "es_prueba_conjunto": True},
            {"nombre": "Eventing Individual",           "nombre_corto": "Event Ind",     "disciplina": "Eventing",  "genero": "TODOS", "unidad": "PUNTOS"},
            {"nombre": "Eventing por Equipos",          "nombre_corto": "Event Eq",      "disciplina": "Eventing",  "genero": "TODOS", "unidad": "PUNTOS", "es_prueba_conjunto": True},
            {"nombre": "Salto Individual",              "nombre_corto": "Salto Ind",     "disciplina": "Salto",     "genero": "TODOS", "unidad": "PUNTOS"},
            {"nombre": "Salto por Equipos",             "nombre_corto": "Salto Eq",      "disciplina": "Salto",     "genero": "TODOS", "unidad": "PUNTOS", "es_prueba_conjunto": True},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 11. ESCALADA DEPORTIVA — 4 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Escalada Deportiva", "tipo": "INDIVIDUAL",
            "tiene_pruebas": True, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [
            {"nombre": "Boulder y Dificultad"},
            {"nombre": "Velocidad"},
        ],
        "pruebas": [
            {"nombre": "Boulder y Dificultad Masculino", "nombre_corto": "Bould+Dif M", "disciplina": "Boulder y Dificultad", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Boulder y Dificultad Femenino",  "nombre_corto": "Bould+Dif F", "disciplina": "Boulder y Dificultad", "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Velocidad Escalada Masculino",   "nombre_corto": "Esc Veloc M", "disciplina": "Velocidad",            "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Velocidad Escalada Femenino",    "nombre_corto": "Esc Veloc F", "disciplina": "Velocidad",            "genero": "FEMENINO",  "unidad": "TIEMPO"},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 12. ESGRIMA — 12 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Esgrima", "tipo": "AMBOS",
            "tiene_pruebas": True, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [
            {"nombre": "Espada"},
            {"nombre": "Florete"},
            {"nombre": "Sable"},
        ],
        "pruebas": [
            {"nombre": "Espada Individual Masculino",   "nombre_corto": "Espada M",    "disciplina": "Espada",   "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Espada Individual Femenino",    "nombre_corto": "Espada F",    "disciplina": "Espada",   "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Espada por Equipos Masculino",  "nombre_corto": "Espada Eq M", "disciplina": "Espada",   "genero": "MASCULINO", "unidad": "PUNTOS", "es_prueba_conjunto": True},
            {"nombre": "Espada por Equipos Femenino",   "nombre_corto": "Espada Eq F", "disciplina": "Espada",   "genero": "FEMENINO",  "unidad": "PUNTOS", "es_prueba_conjunto": True},
            {"nombre": "Florete Individual Masculino",  "nombre_corto": "Florete M",   "disciplina": "Florete",  "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Florete Individual Femenino",   "nombre_corto": "Florete F",   "disciplina": "Florete",  "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Florete por Equipos Masculino", "nombre_corto": "Florete Eq M","disciplina": "Florete",  "genero": "MASCULINO", "unidad": "PUNTOS", "es_prueba_conjunto": True},
            {"nombre": "Florete por Equipos Femenino",  "nombre_corto": "Florete Eq F","disciplina": "Florete",  "genero": "FEMENINO",  "unidad": "PUNTOS", "es_prueba_conjunto": True},
            {"nombre": "Sable Individual Masculino",    "nombre_corto": "Sable M",     "disciplina": "Sable",    "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Sable Individual Femenino",     "nombre_corto": "Sable F",     "disciplina": "Sable",    "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Sable por Equipos Masculino",   "nombre_corto": "Sable Eq M",  "disciplina": "Sable",    "genero": "MASCULINO", "unidad": "PUNTOS", "es_prueba_conjunto": True},
            {"nombre": "Sable por Equipos Femenino",    "nombre_corto": "Sable Eq F",  "disciplina": "Sable",    "genero": "FEMENINO",  "unidad": "PUNTOS", "es_prueba_conjunto": True},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 13. FÚTBOL — 2 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Fútbol", "tipo": "CONJUNTO",
            "tiene_pruebas": False, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Fútbol Masculino", "nombre_corto": "Fútbol M", "disciplina": None, "genero": "MASCULINO", "unidad": "N_A", "es_prueba_conjunto": True},
            {"nombre": "Fútbol Femenino",  "nombre_corto": "Fútbol F", "disciplina": None, "genero": "FEMENINO",  "unidad": "N_A", "es_prueba_conjunto": True},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 14. GIMNASIA — 18 eventos (Artística 14 + Rítmica 2 + Trampolín 2)
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Gimnasia", "tipo": "AMBOS",
            "tiene_pruebas": True, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [
            {"nombre": "Artística"},
            {"nombre": "Rítmica"},
            {"nombre": "Trampolín"},
        ],
        "pruebas": [
            # ── Artística Masculino ──────────────────────────
            {"nombre": "All-Around Individual Masculino",   "nombre_corto": "AA Ind M",    "disciplina": "Artística", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Por Equipos Masculino",             "nombre_corto": "Eq M",        "disciplina": "Artística", "genero": "MASCULINO", "unidad": "PUNTOS", "es_prueba_conjunto": True},
            {"nombre": "Suelo Masculino",                   "nombre_corto": "Suelo M",     "disciplina": "Artística", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Caballo con Arcos Masculino",       "nombre_corto": "C.Arcos M",   "disciplina": "Artística", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Anillas Masculino",                 "nombre_corto": "Anillas M",   "disciplina": "Artística", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Salto Masculino",                   "nombre_corto": "Salto G M",   "disciplina": "Artística", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Barras Paralelas Masculino",        "nombre_corto": "B.Paral M",   "disciplina": "Artística", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Barra Fija Masculino",              "nombre_corto": "B.Fija M",    "disciplina": "Artística", "genero": "MASCULINO", "unidad": "PUNTOS"},
            # ── Artística Femenino ───────────────────────────
            {"nombre": "All-Around Individual Femenino",    "nombre_corto": "AA Ind F",    "disciplina": "Artística", "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Por Equipos Femenino",              "nombre_corto": "Eq F",        "disciplina": "Artística", "genero": "FEMENINO",  "unidad": "PUNTOS", "es_prueba_conjunto": True},
            {"nombre": "Salto Femenino",                    "nombre_corto": "Salto G F",   "disciplina": "Artística", "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Barras Asimétricas Femenino",       "nombre_corto": "B.Asim F",    "disciplina": "Artística", "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Viga de Equilibrio Femenino",       "nombre_corto": "Viga F",      "disciplina": "Artística", "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Suelo Femenino",                    "nombre_corto": "Suelo F",     "disciplina": "Artística", "genero": "FEMENINO",  "unidad": "PUNTOS"},
            # ── Rítmica ──────────────────────────────────────
            {"nombre": "All-Around Individual Rítmica",     "nombre_corto": "RítmicaInd",  "disciplina": "Rítmica",   "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Por Grupos Rítmica",                "nombre_corto": "Rítmica Eq",  "disciplina": "Rítmica",   "genero": "FEMENINO",  "unidad": "PUNTOS", "es_prueba_conjunto": True},
            # ── Trampolín ────────────────────────────────────
            {"nombre": "Trampolín Masculino",               "nombre_corto": "Tramp M",     "disciplina": "Trampolín", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Trampolín Femenino",                "nombre_corto": "Tramp F",     "disciplina": "Trampolín", "genero": "FEMENINO",  "unidad": "PUNTOS"},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 15. GOLF — 2 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Golf", "tipo": "INDIVIDUAL",
            "tiene_pruebas": True, "tiene_categoria": False,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Golf Individual Masculino", "nombre_corto": "Golf M", "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Golf Individual Femenino",  "nombre_corto": "Golf F", "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 16. BALONMANO — 2 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Balonmano", "tipo": "CONJUNTO",
            "tiene_pruebas": False, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Balonmano Masculino", "nombre_corto": "Balonmano M", "disciplina": None, "genero": "MASCULINO", "unidad": "N_A", "es_prueba_conjunto": True},
            {"nombre": "Balonmano Femenino",  "nombre_corto": "Balonmano F", "disciplina": None, "genero": "FEMENINO",  "unidad": "N_A", "es_prueba_conjunto": True},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 17. HOCKEY SOBRE HIERBA — 2 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Hockey sobre Hierba", "tipo": "CONJUNTO",
            "tiene_pruebas": False, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Hockey sobre Hierba Masculino", "nombre_corto": "Hockey M", "disciplina": None, "genero": "MASCULINO", "unidad": "N_A", "es_prueba_conjunto": True},
            {"nombre": "Hockey sobre Hierba Femenino",  "nombre_corto": "Hockey F", "disciplina": None, "genero": "FEMENINO",  "unidad": "N_A", "es_prueba_conjunto": True},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 18. JUDO — 15 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Judo", "tipo": "AMBOS",
            "tiene_pruebas": True, "tiene_categoria": False,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Judo -60kg Masculino",    "nombre_corto": "-60kg M",   "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Judo -66kg Masculino",    "nombre_corto": "-66kg M",   "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Judo -73kg Masculino",    "nombre_corto": "-73kg M",   "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Judo -81kg Masculino",    "nombre_corto": "-81kg M",   "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Judo -90kg Masculino",    "nombre_corto": "-90kg M",   "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Judo -100kg Masculino",   "nombre_corto": "-100kg M",  "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Judo +100kg Masculino",   "nombre_corto": "+100kg M",  "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Judo -48kg Femenino",     "nombre_corto": "-48kg F",   "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Judo -52kg Femenino",     "nombre_corto": "-52kg F",   "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Judo -57kg Femenino",     "nombre_corto": "-57kg F",   "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Judo -63kg Femenino",     "nombre_corto": "-63kg F",   "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Judo -70kg Femenino",     "nombre_corto": "-70kg F",   "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Judo -78kg Femenino",     "nombre_corto": "-78kg F",   "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Judo +78kg Femenino",     "nombre_corto": "+78kg F",   "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Judo por Equipos Mixto",  "nombre_corto": "Judo Eq Mx","disciplina": None, "genero": "MIXTO",     "unidad": "PUNTOS", "es_prueba_conjunto": True},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 19. LUCHA — 18 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Lucha", "tipo": "INDIVIDUAL",
            "tiene_pruebas": True, "tiene_categoria": False,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [
            {"nombre": "Libre Masculina"},
            {"nombre": "Libre Femenina"},
            {"nombre": "Grecorromana"},
        ],
        "pruebas": [
            # ── Libre Masculino ──────────────────────────────
            {"nombre": "Lucha Libre -57kg Masculino",       "nombre_corto": "LibreM -57",   "disciplina": "Libre Masculina", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Lucha Libre -65kg Masculino",       "nombre_corto": "LibreM -65",   "disciplina": "Libre Masculina", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Lucha Libre -74kg Masculino",       "nombre_corto": "LibreM -74",   "disciplina": "Libre Masculina", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Lucha Libre -86kg Masculino",       "nombre_corto": "LibreM -86",   "disciplina": "Libre Masculina", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Lucha Libre -97kg Masculino",       "nombre_corto": "LibreM -97",   "disciplina": "Libre Masculina", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Lucha Libre +125kg Masculino",      "nombre_corto": "LibreM +125",  "disciplina": "Libre Masculina", "genero": "MASCULINO", "unidad": "PUNTOS"},
            # ── Libre Femenino ───────────────────────────────
            {"nombre": "Lucha Libre -50kg Femenino",        "nombre_corto": "LibreF -50",   "disciplina": "Libre Femenina",  "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Lucha Libre -53kg Femenino",        "nombre_corto": "LibreF -53",   "disciplina": "Libre Femenina",  "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Lucha Libre -57kg Femenino",        "nombre_corto": "LibreF -57",   "disciplina": "Libre Femenina",  "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Lucha Libre -62kg Femenino",        "nombre_corto": "LibreF -62",   "disciplina": "Libre Femenina",  "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Lucha Libre -68kg Femenino",        "nombre_corto": "LibreF -68",   "disciplina": "Libre Femenina",  "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Lucha Libre -76kg Femenino",        "nombre_corto": "LibreF -76",   "disciplina": "Libre Femenina",  "genero": "FEMENINO",  "unidad": "PUNTOS"},
            # ── Grecorromana Masculino ───────────────────────
            {"nombre": "Lucha Grecorromana -60kg Masculino","nombre_corto": "GR -60",       "disciplina": "Grecorromana",    "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Lucha Grecorromana -67kg Masculino","nombre_corto": "GR -67",       "disciplina": "Grecorromana",    "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Lucha Grecorromana -77kg Masculino","nombre_corto": "GR -77",       "disciplina": "Grecorromana",    "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Lucha Grecorromana -87kg Masculino","nombre_corto": "GR -87",       "disciplina": "Grecorromana",    "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Lucha Grecorromana -97kg Masculino","nombre_corto": "GR -97",       "disciplina": "Grecorromana",    "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Lucha Grecorromana +130kg Masculino","nombre_corto":"GR +130",      "disciplina": "Grecorromana",    "genero": "MASCULINO", "unidad": "PUNTOS"},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 20. PENTATLÓN MODERNO — 2 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Pentatlón Moderno", "tipo": "INDIVIDUAL",
            "tiene_pruebas": True, "tiene_categoria": False,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Pentatlón Moderno Masculino", "nombre_corto": "Pentatl M", "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Pentatlón Moderno Femenino",  "nombre_corto": "Pentatl F", "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 21. REMO — 14 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Remo", "tipo": "AMBOS",
            "tiene_pruebas": True, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Scull Individual Masculino",        "nombre_corto": "Scull 1x M",  "disciplina": None, "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Scull Individual Femenino",         "nombre_corto": "Scull 1x F",  "disciplina": None, "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "Doble Scull Masculino",             "nombre_corto": "Scull 2x M",  "disciplina": None, "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Doble Scull Femenino",              "nombre_corto": "Scull 2x F",  "disciplina": None, "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "Doble Scull Peso Ligero Masculino", "nombre_corto": "Scull 2xPL M","disciplina": None, "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Doble Scull Peso Ligero Femenino",  "nombre_corto": "Scull 2xPL F","disciplina": None, "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "Cuádruple Scull Masculino",         "nombre_corto": "Scull 4x M",  "disciplina": None, "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Cuádruple Scull Femenino",          "nombre_corto": "Scull 4x F",  "disciplina": None, "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "Par sin Timonel Masculino",         "nombre_corto": "Par 2- M",    "disciplina": None, "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Par sin Timonel Femenino",          "nombre_corto": "Par 2- F",    "disciplina": None, "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "Cuatro sin Timonel Masculino",      "nombre_corto": "Cuatro 4- M", "disciplina": None, "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Cuatro sin Timonel Femenino",       "nombre_corto": "Cuatro 4- F", "disciplina": None, "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "Ocho con Timonel Masculino",        "nombre_corto": "Ocho 8+ M",   "disciplina": None, "genero": "MASCULINO", "unidad": "TIEMPO", "es_prueba_conjunto": True},
            {"nombre": "Ocho con Timonel Femenino",         "nombre_corto": "Ocho 8+ F",   "disciplina": None, "genero": "FEMENINO",  "unidad": "TIEMPO", "es_prueba_conjunto": True},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 22. RUGBY 7 — 2 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Rugby 7", "tipo": "CONJUNTO",
            "tiene_pruebas": False, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Rugby 7 Masculino", "nombre_corto": "Rugby7 M", "disciplina": None, "genero": "MASCULINO", "unidad": "N_A", "es_prueba_conjunto": True},
            {"nombre": "Rugby 7 Femenino",  "nombre_corto": "Rugby7 F", "disciplina": None, "genero": "FEMENINO",  "unidad": "N_A", "es_prueba_conjunto": True},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 23. VELA — 10 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Vela", "tipo": "AMBOS",
            "tiene_pruebas": True, "tiene_categoria": False,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [
            {"nombre": "Windsurf"},
            {"nombre": "Kitesurf"},
            {"nombre": "Dinghy"},
            {"nombre": "Skiff"},
            {"nombre": "Multicasco"},
        ],
        "pruebas": [
            {"nombre": "iQFOiL Masculino (Windsurf)",    "nombre_corto": "iQFOiL M",   "disciplina": "Windsurf",   "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "iQFOiL Femenino (Windsurf)",     "nombre_corto": "iQFOiL F",   "disciplina": "Windsurf",   "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Formula Kite Masculino",         "nombre_corto": "Kite M",     "disciplina": "Kitesurf",   "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Formula Kite Femenino",          "nombre_corto": "Kite F",     "disciplina": "Kitesurf",   "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Dinghy ILCA 7 Masculino",        "nombre_corto": "ILCA7 M",    "disciplina": "Dinghy",     "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Dinghy ILCA 6 Femenino",         "nombre_corto": "ILCA6 F",    "disciplina": "Dinghy",     "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Dinghy 470 Mixto",               "nombre_corto": "470 Mx",     "disciplina": "Dinghy",     "genero": "MIXTO",     "unidad": "PUNTOS"},
            {"nombre": "Skiff 49er Masculino",           "nombre_corto": "49er M",     "disciplina": "Skiff",      "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Skiff 49erFX Femenino",          "nombre_corto": "49erFX F",   "disciplina": "Skiff",      "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Nacra 17 Mixto (Multicasco)",    "nombre_corto": "Nacra17 Mx", "disciplina": "Multicasco", "genero": "MIXTO",     "unidad": "PUNTOS"},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 24. TIRO — 15 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Tiro", "tipo": "INDIVIDUAL",
            "tiene_pruebas": True, "tiene_categoria": False,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [
            {"nombre": "Rifle"},
            {"nombre": "Pistola"},
            {"nombre": "Escopeta"},
        ],
        "pruebas": [
            # ── Rifle ────────────────────────────────────────
            {"nombre": "Rifle Aire 10m Masculino",              "nombre_corto": "Rifle10 M",   "disciplina": "Rifle",    "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Rifle Aire 10m Femenino",               "nombre_corto": "Rifle10 F",   "disciplina": "Rifle",    "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Rifle Aire 10m Mixto",                  "nombre_corto": "Rifle10 Mx",  "disciplina": "Rifle",    "genero": "MIXTO",     "unidad": "PUNTOS"},
            {"nombre": "Rifle 3 Posiciones 50m Masculino",      "nombre_corto": "R3Pos M",     "disciplina": "Rifle",    "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Rifle 3 Posiciones 50m Femenino",       "nombre_corto": "R3Pos F",     "disciplina": "Rifle",    "genero": "FEMENINO",  "unidad": "PUNTOS"},
            # ── Pistola ──────────────────────────────────────
            {"nombre": "Pistola Aire 10m Masculino",            "nombre_corto": "Pistola10 M", "disciplina": "Pistola",  "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Pistola Aire 10m Femenino",             "nombre_corto": "Pistola10 F", "disciplina": "Pistola",  "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Pistola Aire 10m Mixto",                "nombre_corto": "Pistola Mx",  "disciplina": "Pistola",  "genero": "MIXTO",     "unidad": "PUNTOS"},
            {"nombre": "Pistola Fuego Rápido 25m Masculino",    "nombre_corto": "PistFR M",    "disciplina": "Pistola",  "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Pistola 25m Femenino",                  "nombre_corto": "Pist25 F",    "disciplina": "Pistola",  "genero": "FEMENINO",  "unidad": "PUNTOS"},
            # ── Escopeta ─────────────────────────────────────
            {"nombre": "Fosa Olímpica Masculino",               "nombre_corto": "Fosa M",      "disciplina": "Escopeta", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Fosa Olímpica Femenino",                "nombre_corto": "Fosa F",      "disciplina": "Escopeta", "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Fosa Olímpica Mixto",                   "nombre_corto": "Fosa Mx",     "disciplina": "Escopeta", "genero": "MIXTO",     "unidad": "PUNTOS"},
            {"nombre": "Skeet Masculino",                       "nombre_corto": "Skeet M",     "disciplina": "Escopeta", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Skeet Femenino",                        "nombre_corto": "Skeet F",     "disciplina": "Escopeta", "genero": "FEMENINO",  "unidad": "PUNTOS"},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 25. SKATEBOARDING — 4 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Skateboarding", "tipo": "INDIVIDUAL",
            "tiene_pruebas": True, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [
            {"nombre": "Street"},
            {"nombre": "Park"},
        ],
        "pruebas": [
            {"nombre": "Street Masculino",  "nombre_corto": "Street M",  "disciplina": "Street", "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Street Femenino",   "nombre_corto": "Street F",  "disciplina": "Street", "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Park Masculino",    "nombre_corto": "Park M",    "disciplina": "Park",   "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Park Femenino",     "nombre_corto": "Park F",    "disciplina": "Park",   "genero": "FEMENINO",  "unidad": "PUNTOS"},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 26. SURF — 2 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Surf", "tipo": "INDIVIDUAL",
            "tiene_pruebas": True, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Surf Masculino", "nombre_corto": "Surf M", "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Surf Femenino",  "nombre_corto": "Surf F", "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 27. TENIS DE MESA — 5 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Tenis de Mesa", "tipo": "AMBOS",
            "tiene_pruebas": True, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Individual Masculino TM",       "nombre_corto": "TM Ind M",    "disciplina": None, "genero": "MASCULINO", "unidad": "SETS"},
            {"nombre": "Individual Femenino TM",        "nombre_corto": "TM Ind F",    "disciplina": None, "genero": "FEMENINO",  "unidad": "SETS"},
            {"nombre": "Por Equipos Masculino TM",      "nombre_corto": "TM Eq M",     "disciplina": None, "genero": "MASCULINO", "unidad": "SETS", "es_prueba_conjunto": True},
            {"nombre": "Por Equipos Femenino TM",       "nombre_corto": "TM Eq F",     "disciplina": None, "genero": "FEMENINO",  "unidad": "SETS", "es_prueba_conjunto": True},
            {"nombre": "Dobles Mixto TM",               "nombre_corto": "TM Dob Mx",   "disciplina": None, "genero": "MIXTO",     "unidad": "SETS"},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 28. TAEKWONDO — 8 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Taekwondo", "tipo": "INDIVIDUAL",
            "tiene_pruebas": True, "tiene_categoria": False,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Taekwondo -58kg Masculino",   "nombre_corto": "TKD -58M",   "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Taekwondo -68kg Masculino",   "nombre_corto": "TKD -68M",   "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Taekwondo -80kg Masculino",   "nombre_corto": "TKD -80M",   "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Taekwondo +80kg Masculino",   "nombre_corto": "TKD +80M",   "disciplina": None, "genero": "MASCULINO", "unidad": "PUNTOS"},
            {"nombre": "Taekwondo -49kg Femenino",    "nombre_corto": "TKD -49F",   "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Taekwondo -57kg Femenino",    "nombre_corto": "TKD -57F",   "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Taekwondo -67kg Femenino",    "nombre_corto": "TKD -67F",   "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
            {"nombre": "Taekwondo +67kg Femenino",    "nombre_corto": "TKD +67F",   "disciplina": None, "genero": "FEMENINO",  "unidad": "PUNTOS"},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 29. TENIS — 5 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Tenis", "tipo": "AMBOS",
            "tiene_pruebas": True, "tiene_categoria": False,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Individual Masculino Tenis",    "nombre_corto": "Tenis Ind M",  "disciplina": None, "genero": "MASCULINO", "unidad": "SETS"},
            {"nombre": "Individual Femenino Tenis",     "nombre_corto": "Tenis Ind F",  "disciplina": None, "genero": "FEMENINO",  "unidad": "SETS"},
            {"nombre": "Dobles Masculino Tenis",        "nombre_corto": "Tenis Dob M",  "disciplina": None, "genero": "MASCULINO", "unidad": "SETS"},
            {"nombre": "Dobles Femenino Tenis",         "nombre_corto": "Tenis Dob F",  "disciplina": None, "genero": "FEMENINO",  "unidad": "SETS"},
            {"nombre": "Dobles Mixto Tenis",            "nombre_corto": "Tenis Dob Mx", "disciplina": None, "genero": "MIXTO",     "unidad": "SETS"},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 30. TRIATLÓN — 3 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Triatlón", "tipo": "AMBOS",
            "tiene_pruebas": True, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Triatlón Individual Masculino", "nombre_corto": "Triatl M",    "disciplina": None, "genero": "MASCULINO", "unidad": "TIEMPO"},
            {"nombre": "Triatlón Individual Femenino",  "nombre_corto": "Triatl F",    "disciplina": None, "genero": "FEMENINO",  "unidad": "TIEMPO"},
            {"nombre": "Triatlón Relevos Mixtos",       "nombre_corto": "Triatl Mx",   "disciplina": None, "genero": "MIXTO",     "unidad": "TIEMPO", "es_relevos": True},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 31. VOLEIBOL — 4 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Voleibol", "tipo": "CONJUNTO",
            "tiene_pruebas": True, "tiene_categoria": True,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [
            {"nombre": "Indoor"},
            {"nombre": "Playa"},
        ],
        "pruebas": [
            {"nombre": "Voleibol Indoor Masculino",  "nombre_corto": "Voley M",      "disciplina": "Indoor", "genero": "MASCULINO", "unidad": "SETS", "es_prueba_conjunto": True},
            {"nombre": "Voleibol Indoor Femenino",   "nombre_corto": "Voley F",      "disciplina": "Indoor", "genero": "FEMENINO",  "unidad": "SETS", "es_prueba_conjunto": True},
            {"nombre": "Voleibol Playa Masculino",   "nombre_corto": "V.Playa M",    "disciplina": "Playa",  "genero": "MASCULINO", "unidad": "SETS", "es_prueba_conjunto": True},
            {"nombre": "Voleibol Playa Femenino",    "nombre_corto": "V.Playa F",    "disciplina": "Playa",  "genero": "FEMENINO",  "unidad": "SETS", "es_prueba_conjunto": True},
        ],
    },

    # ════════════════════════════════════════════════════════
    # 32. HALTEROFILIA — 10 eventos
    # ════════════════════════════════════════════════════════
    {
        "deporte": {
            "nombre": "Halterofilia", "tipo": "INDIVIDUAL",
            "tiene_pruebas": True, "tiene_categoria": False,
            "tiene_clasificacion_funcional": False, "es_olimpico": True,
        },
        "disciplinas": [],
        "pruebas": [
            {"nombre": "Halterofilia -61kg Masculino",   "nombre_corto": "-61kg M",    "disciplina": None, "genero": "MASCULINO", "unidad": "DISTANCIA"},
            {"nombre": "Halterofilia -73kg Masculino",   "nombre_corto": "-73kg M",    "disciplina": None, "genero": "MASCULINO", "unidad": "DISTANCIA"},
            {"nombre": "Halterofilia -89kg Masculino",   "nombre_corto": "-89kg M",    "disciplina": None, "genero": "MASCULINO", "unidad": "DISTANCIA"},
            {"nombre": "Halterofilia -102kg Masculino",  "nombre_corto": "-102kg M",   "disciplina": None, "genero": "MASCULINO", "unidad": "DISTANCIA"},
            {"nombre": "Halterofilia +102kg Masculino",  "nombre_corto": "+102kg M",   "disciplina": None, "genero": "MASCULINO", "unidad": "DISTANCIA"},
            {"nombre": "Halterofilia -49kg Femenino",    "nombre_corto": "-49kg F",    "disciplina": None, "genero": "FEMENINO",  "unidad": "DISTANCIA"},
            {"nombre": "Halterofilia -59kg Femenino",    "nombre_corto": "-59kg F",    "disciplina": None, "genero": "FEMENINO",  "unidad": "DISTANCIA"},
            {"nombre": "Halterofilia -71kg Femenino",    "nombre_corto": "-71kg F",    "disciplina": None, "genero": "FEMENINO",  "unidad": "DISTANCIA"},
            {"nombre": "Halterofilia -81kg Femenino",    "nombre_corto": "-81kg F",    "disciplina": None, "genero": "FEMENINO",  "unidad": "DISTANCIA"},
            {"nombre": "Halterofilia +81kg Femenino",    "nombre_corto": "+81kg F",    "disciplina": None, "genero": "FEMENINO",  "unidad": "DISTANCIA"},
        ],
    },
]
