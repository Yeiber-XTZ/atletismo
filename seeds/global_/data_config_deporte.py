# =============================================================
# backend/app/db/seeds/global_/data_config_deporte.py
#
# Configuracion ODF para las 48 pruebas de Atletismo.
#
# Estructura de cada entrada:
# {
#   "prueba_nombre": str,       # Debe coincidir exactamente con data.py
#   "codigo_rsc": str | None,   # ODF Result System Code (34 chars)
#   "requiere_viento": bool,
#   "max_intentos": int | None, # null = sin limite (pista)
#   "es_combinada_padre": bool,
#   "combinada_sub_pruebas": list | None,
#   "valor_minimo": float | None,
#   "valor_maximo": float | None,
#   "config_especifica": dict,  # tipo, umbral_viento, etc.
# }
#
# Tipos atletismo (en config_especifica.tipo):
#   PISTA              — carreras en pista
#   CAMPO_VERTICAL     — salto alto, garrocha (intentos por altura)
#   CAMPO_HORIZONTAL   — salto largo, triple (hasta 6 intentos, mejor marca)
#   CAMPO_LANZAMIENTO  — bala, disco, martillo, jabalina (6 intentos)
#   COMBINADA          — decatlon / heptatlon (padre, sin resultado directo)
#   MARCHA             — marcha atletica
#   RUTA               — maraton
#
# RSC format atletismo: ATM + disciplina(3) + genero(1) + evento(...)
# =============================================================

from __future__ import annotations

from typing import Any

# Sub-pruebas del Decatlon Masculino (orden, nombre_prueba, clave_motor_iaaf)
_DECATLON_SUB = [
    {"orden": 1,  "prueba_nombre": "100m Plano Masculino",           "clave_motor": "100m_M",     "dia": 1},
    {"orden": 2,  "prueba_nombre": "Salto Largo Masculino",           "clave_motor": "Largo_M",    "dia": 1},
    {"orden": 3,  "prueba_nombre": "Lanzamiento Bala Masculino",      "clave_motor": "Bala_M",     "dia": 1},
    {"orden": 4,  "prueba_nombre": "Salto Alto Masculino",            "clave_motor": "Alto_M",     "dia": 1},
    {"orden": 5,  "prueba_nombre": "400m Plano Masculino",            "clave_motor": "400m_M",     "dia": 1},
    {"orden": 6,  "prueba_nombre": "110m Vallas Masculino",           "clave_motor": "110mV_M",    "dia": 2},
    {"orden": 7,  "prueba_nombre": "Lanzamiento Disco Masculino",     "clave_motor": "Disco_M",    "dia": 2},
    {"orden": 8,  "prueba_nombre": "Salto con Garrocha Masculino",    "clave_motor": "Garrocha_M", "dia": 2},
    {"orden": 9,  "prueba_nombre": "Lanzamiento Jabalina Masculino",  "clave_motor": "Jabalina_M", "dia": 2},
    {"orden": 10, "prueba_nombre": "1500m Masculino",                 "clave_motor": "1500m_M",    "dia": 2},
]

# Sub-pruebas del Heptatlon Femenino
_HEPTATLON_SUB = [
    {"orden": 1, "prueba_nombre": "100m Vallas Femenino",            "clave_motor": "100mV_F",    "dia": 1},
    {"orden": 2, "prueba_nombre": "Salto Alto Femenino",             "clave_motor": "Alto_F",     "dia": 1},
    {"orden": 3, "prueba_nombre": "Lanzamiento Bala Femenino",       "clave_motor": "Bala_F",     "dia": 1},
    {"orden": 4, "prueba_nombre": "200m Plano Femenino",             "clave_motor": "200m_F",     "dia": 1},
    {"orden": 5, "prueba_nombre": "Salto Largo Femenino",            "clave_motor": "Largo_F",    "dia": 2},
    {"orden": 6, "prueba_nombre": "Lanzamiento Jabalina Femenino",   "clave_motor": "Jabalina_F", "dia": 2},
    {"orden": 7, "prueba_nombre": "800m Femenino",                   "clave_motor": "800m_F",     "dia": 2},
]

_PISTA = "PISTA"
_CAMPO_V = "CAMPO_VERTICAL"
_CAMPO_H = "CAMPO_HORIZONTAL"
_CAMPO_L = "CAMPO_LANZAMIENTO"
_COMBINADA = "COMBINADA"
_MARCHA = "MARCHA"
_RUTA = "RUTA"


def _pista(nombre: str, rsc: str | None, viento: bool = False,
           v_min: float | None = None, v_max: float | None = None) -> dict[str, Any]:
    return {
        "prueba_nombre": nombre,
        "codigo_rsc": rsc,
        "requiere_viento": viento,
        "max_intentos": None,
        "es_combinada_padre": False,
        "combinada_sub_pruebas": None,
        "valor_minimo": v_min,
        "valor_maximo": v_max,
        "config_especifica": {"tipo": _PISTA, "umbral_viento_legal": 2.0 if viento else None},
    }


def _campo_v(nombre: str, rsc: str | None,
             v_min: float | None = None, v_max: float | None = None) -> dict[str, Any]:
    """Salto alto / garrocha: intentos por barra, sin limite fijo de intentos."""
    return {
        "prueba_nombre": nombre,
        "codigo_rsc": rsc,
        "requiere_viento": False,
        "max_intentos": None,   # No tiene limite: se salta hasta fallar 3 veces en la misma barra
        "es_combinada_padre": False,
        "combinada_sub_pruebas": None,
        "valor_minimo": v_min,
        "valor_maximo": v_max,
        "config_especifica": {"tipo": _CAMPO_V},
    }


def _campo_h(nombre: str, rsc: str | None, viento: bool = True,
             v_min: float | None = None, v_max: float | None = None) -> dict[str, Any]:
    """Salto largo / triple salto: 6 intentos, mejor marca, con viento."""
    return {
        "prueba_nombre": nombre,
        "codigo_rsc": rsc,
        "requiere_viento": viento,
        "max_intentos": 6,
        "es_combinada_padre": False,
        "combinada_sub_pruebas": None,
        "valor_minimo": v_min,
        "valor_maximo": v_max,
        "config_especifica": {"tipo": _CAMPO_H, "umbral_viento_legal": 2.0},
    }


def _campo_l(nombre: str, rsc: str | None,
             v_min: float | None = None, v_max: float | None = None) -> dict[str, Any]:
    """Lanzamientos (bala, disco, martillo, jabalina): 6 intentos, sin viento."""
    return {
        "prueba_nombre": nombre,
        "codigo_rsc": rsc,
        "requiere_viento": False,
        "max_intentos": 6,
        "es_combinada_padre": False,
        "combinada_sub_pruebas": None,
        "valor_minimo": v_min,
        "valor_maximo": v_max,
        "config_especifica": {"tipo": _CAMPO_L},
    }


def _combinada(nombre: str, rsc: str | None, sub_pruebas: list) -> dict[str, Any]:
    return {
        "prueba_nombre": nombre,
        "codigo_rsc": rsc,
        "requiere_viento": False,
        "max_intentos": None,
        "es_combinada_padre": True,
        "combinada_sub_pruebas": sub_pruebas,
        "valor_minimo": None,
        "valor_maximo": None,
        "config_especifica": {"tipo": _COMBINADA},
    }


def _marcha(nombre: str, rsc: str | None,
            v_min: float | None = None, v_max: float | None = None) -> dict[str, Any]:
    return {
        "prueba_nombre": nombre,
        "codigo_rsc": rsc,
        "requiere_viento": False,
        "max_intentos": None,
        "es_combinada_padre": False,
        "combinada_sub_pruebas": None,
        "valor_minimo": v_min,
        "valor_maximo": v_max,
        "config_especifica": {"tipo": _MARCHA},
    }


def _ruta(nombre: str, rsc: str | None,
          v_min: float | None = None, v_max: float | None = None) -> dict[str, Any]:
    return {
        "prueba_nombre": nombre,
        "codigo_rsc": rsc,
        "requiere_viento": False,
        "max_intentos": None,
        "es_combinada_padre": False,
        "combinada_sub_pruebas": None,
        "valor_minimo": v_min,
        "valor_maximo": v_max,
        "config_especifica": {"tipo": _RUTA},
    }


# =============================================================
# ATLETISMO — 48 pruebas
# =============================================================
CONFIG_ATLETISMO: list[dict[str, Any]] = [

    # ── Pista Masculino ──────────────────────────────────────
    _pista("100m Plano Masculino",         "ATM001M100------FNL-000100--", viento=True,  v_min=9.0,  v_max=30.0),
    _pista("200m Plano Masculino",         "ATM001M200------FNL-000100--", viento=True,  v_min=18.0, v_max=60.0),
    _pista("400m Plano Masculino",         "ATM001M400------FNL-000100--", viento=False, v_min=40.0, v_max=120.0),
    _pista("800m Masculino",               "ATM001M800------FNL-000100--", viento=False, v_min=90.0, v_max=300.0),
    _pista("1500m Masculino",              "ATM001M1500-----FNL-000100--", viento=False, v_min=200.0, v_max=600.0),
    _pista("5000m Masculino",              "ATM001M5000-----FNL-000100--", viento=False, v_min=700.0, v_max=1800.0),
    _pista("10000m Masculino",             "ATM001M10000----FNL-000100--", viento=False, v_min=1600.0, v_max=3600.0),
    _pista("110m Vallas Masculino",        "ATM001M110H-----FNL-000100--", viento=True,  v_min=12.0, v_max=40.0),
    _pista("400m Vallas Masculino",        "ATM001M400H-----FNL-000100--", viento=False, v_min=45.0, v_max=120.0),
    _pista("3000m Obstáculos Masculino",   "ATM001M3000S----FNL-000100--", viento=False, v_min=480.0, v_max=1200.0),
    _pista("4x100m Relevos Masculino",     "ATM001M4X100----FNL-000100--", viento=False, v_min=37.0, v_max=60.0),
    _pista("4x400m Relevos Masculino",     "ATM001M4X400----FNL-000100--", viento=False, v_min=170.0, v_max=300.0),

    # ── Campo Masculino ──────────────────────────────────────
    _campo_v("Salto Alto Masculino",          "ATM001MHJ-------FNL-000100--", v_min=1.5, v_max=3.0),
    _campo_v("Salto con Garrocha Masculino",  "ATM001MPV-------FNL-000100--", v_min=3.0, v_max=7.0),
    _campo_h("Salto Largo Masculino",         "ATM001MLJ-------FNL-000100--", v_min=5.0, v_max=10.0),
    _campo_h("Triple Salto Masculino",        "ATM001MTJ-------FNL-000100--", v_min=10.0, v_max=20.0),
    _campo_l("Lanzamiento Bala Masculino",    "ATM001MSP-------FNL-000100--", v_min=5.0, v_max=25.0),
    _campo_l("Lanzamiento Disco Masculino",   "ATM001MDT-------FNL-000100--", v_min=20.0, v_max=80.0),
    _campo_l("Lanzamiento Martillo Masculino","ATM001MHT-------FNL-000100--", v_min=30.0, v_max=90.0),
    _campo_l("Lanzamiento Jabalina Masculino","ATM001MJT-------FNL-000100--", v_min=30.0, v_max=110.0),

    # ── Combinadas / Marcha / Ruta Masculino ─────────────────
    _combinada("Decatlón Masculino",      "ATM001MDec------FNL-000100--", _DECATLON_SUB),
    _marcha("Marcha 20km Masculino",      "ATM001M20KW-----FNL-000100--", v_min=3600.0, v_max=10800.0),
    _ruta("Maratón Masculino",            "ATM001MMAR------FNL-000100--", v_min=6000.0, v_max=18000.0),

    # ── Pista Femenino ───────────────────────────────────────
    _pista("100m Plano Femenino",         "ATM001W100------FNL-000100--", viento=True,  v_min=10.0, v_max=30.0),
    _pista("200m Plano Femenino",         "ATM001W200------FNL-000100--", viento=True,  v_min=20.0, v_max=60.0),
    _pista("400m Plano Femenino",         "ATM001W400------FNL-000100--", viento=False, v_min=45.0, v_max=120.0),
    _pista("800m Femenino",               "ATM001W800------FNL-000100--", viento=False, v_min=100.0, v_max=300.0),
    _pista("1500m Femenino",              "ATM001W1500-----FNL-000100--", viento=False, v_min=220.0, v_max=600.0),
    _pista("5000m Femenino",              "ATM001W5000-----FNL-000100--", viento=False, v_min=800.0, v_max=1800.0),
    _pista("10000m Femenino",             "ATM001W10000----FNL-000100--", viento=False, v_min=1800.0, v_max=3600.0),
    _pista("100m Vallas Femenino",        "ATM001W100H-----FNL-000100--", viento=True,  v_min=12.0, v_max=40.0),
    _pista("400m Vallas Femenino",        "ATM001W400H-----FNL-000100--", viento=False, v_min=48.0, v_max=120.0),
    _pista("3000m Obstáculos Femenino",   "ATM001W3000S----FNL-000100--", viento=False, v_min=540.0, v_max=1200.0),
    _pista("4x100m Relevos Femenino",     "ATM001W4X100----FNL-000100--", viento=False, v_min=40.0, v_max=60.0),
    _pista("4x400m Relevos Femenino",     "ATM001W4X400----FNL-000100--", viento=False, v_min=180.0, v_max=300.0),

    # ── Campo Femenino ───────────────────────────────────────
    _campo_v("Salto Alto Femenino",          "ATM001WHJ-------FNL-000100--", v_min=1.2, v_max=2.5),
    _campo_v("Salto con Garrocha Femenino",  "ATM001WPV-------FNL-000100--", v_min=2.5, v_max=6.0),
    _campo_h("Salto Largo Femenino",         "ATM001WLJ-------FNL-000100--", v_min=4.0, v_max=8.5),
    _campo_h("Triple Salto Femenino",        "ATM001WTJ-------FNL-000100--", v_min=8.0, v_max=16.0),
    _campo_l("Lanzamiento Bala Femenino",    "ATM001WSP-------FNL-000100--", v_min=5.0, v_max=25.0),
    _campo_l("Lanzamiento Disco Femenino",   "ATM001WDT-------FNL-000100--", v_min=15.0, v_max=75.0),
    _campo_l("Lanzamiento Martillo Femenino","ATM001WHT-------FNL-000100--", v_min=20.0, v_max=85.0),
    _campo_l("Lanzamiento Jabalina Femenino","ATM001WJT-------FNL-000100--", v_min=20.0, v_max=75.0),

    # ── Combinadas / Marcha / Ruta Femenino ──────────────────
    _combinada("Heptatlón Femenino",      "ATM001WHep------FNL-000100--", _HEPTATLON_SUB),
    _marcha("Marcha 20km Femenino",       "ATM001W20KW-----FNL-000100--", v_min=4200.0, v_max=10800.0),
    _ruta("Maratón Femenino",             "ATM001WMAR------FNL-000100--", v_min=7200.0, v_max=18000.0),

    # ── Mixtas ───────────────────────────────────────────────
    _pista("4x400m Relevos Mixto",        "ATM001X4X400----FNL-000100--", viento=False, v_min=175.0, v_max=300.0),
    _marcha("Marcha Maratón Mixto",       "ATM001XMARW-----FNL-000100--", v_min=5400.0, v_max=18000.0),
]
