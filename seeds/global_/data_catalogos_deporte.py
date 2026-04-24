# =============================================================
# backend/app/db/seeds/global_/data_catalogos_deporte.py
#
# Datos semilla para catálogos deportivos globales:
#   - CategoriaEdad
#   - CargoPersonal
#   - UnidadMedida
# =============================================================

from __future__ import annotations

from typing import Any

CATEGORIAS_EDAD_DATA: list[dict[str, Any]] = [
    {"codigo": "PRE_INF", "nombre": "Pre-infantil", "edad_minima": 6,  "edad_maxima": 9,    "genero_aplicable": "TODOS", "orden": 1, "activo": True},
    {"codigo": "INF",     "nombre": "Infantil",      "edad_minima": 10, "edad_maxima": 11,   "genero_aplicable": "TODOS", "orden": 2, "activo": True},
    {"codigo": "PRE_JUV", "nombre": "Pre-juvenil",   "edad_minima": 12, "edad_maxima": 13,   "genero_aplicable": "TODOS", "orden": 3, "activo": True},
    {"codigo": "JUV",     "nombre": "Juvenil",        "edad_minima": 14, "edad_maxima": 17,   "genero_aplicable": "TODOS", "orden": 4, "activo": True},
    {"codigo": "MAY",     "nombre": "Mayores",        "edad_minima": 18, "edad_maxima": None, "genero_aplicable": "TODOS", "orden": 5, "activo": True},
]

CARGOS_PERSONAL_DATA: list[dict[str, Any]] = [
    {"codigo": "ENT_PPAL",  "nombre": "Entrenador Principal",  "aplica_deportistas": False, "requiere_certificado": False, "genera_credencial": True, "orden": 1, "activo": True},
    {"codigo": "ENT_ASI",   "nombre": "Entrenador Asistente",  "aplica_deportistas": False, "requiere_certificado": False, "genera_credencial": True, "orden": 2, "activo": True},
    {"codigo": "DELEGADO",  "nombre": "Delegado Técnico",      "aplica_deportistas": False, "requiere_certificado": False, "genera_credencial": True, "orden": 3, "activo": True},
    {"codigo": "MEDICO",    "nombre": "Médico Deportivo",      "aplica_deportistas": False, "requiere_certificado": True,  "genera_credencial": True, "orden": 4, "activo": True},
    {"codigo": "FISIO",     "nombre": "Fisioterapeuta",        "aplica_deportistas": False, "requiere_certificado": True,  "genera_credencial": True, "orden": 5, "activo": True},
    {"codigo": "PSICOLOGO", "nombre": "Psicólogo Deportivo",  "aplica_deportistas": False, "requiere_certificado": True,  "genera_credencial": True, "orden": 6, "activo": True},
    {"codigo": "UTILERO",   "nombre": "Utilero",               "aplica_deportistas": False, "requiere_certificado": False, "genera_credencial": True, "orden": 7, "activo": True},
]

UNIDADES_MEDIDA_DATA: list[dict[str, Any]] = [
    {"codigo": "SEG", "nombre": "Segundos",   "simbolo": "s",   "tipo": "TIEMPO",    "formato_display": "MM:SS.mm", "mayor_es_mejor": False, "activo": True},
    {"codigo": "MTS", "nombre": "Metros",     "simbolo": "m",   "tipo": "DISTANCIA", "formato_display": "##.## m",  "mayor_es_mejor": True,  "activo": True},
    {"codigo": "PTS", "nombre": "Puntos",     "simbolo": "pts", "tipo": "PUNTOS",    "formato_display": None,       "mayor_es_mejor": True,  "activo": True},
    {"codigo": "KG",  "nombre": "Kilogramos", "simbolo": "kg",  "tipo": "PESO",      "formato_display": "#.### kg", "mayor_es_mejor": True,  "activo": True},
    {"codigo": "ESP", "nombre": "Especial",   "simbolo": "",    "tipo": "ESPECIAL",  "formato_display": None,       "mayor_es_mejor": True,  "activo": True},
]
