# =============================================================
# Seeds de EPS colombianas (Entidades Promotoras de Salud)
# Fuente: Minsalud / ADRES — actualizado 2025
# =============================================================

from typing import Any

EPS: list[dict[str, Any]] = [
    # ── AMBOS REGIMENES ──────────────────────────────────────
    {"codigo": "ESS024", "nit": "900226715", "nombre": "Coosalud EPS-S",                                    "regimen": "SUBSIDIADO",   "activo": True},
    {"codigo": "EPS042", "nit": "900226716", "nombre": "Coosalud EPS (Contributivo)",                       "regimen": "CONTRIBUTIVO", "activo": True},
    {"codigo": "EPS037", "nit": "900156264", "nombre": "Nueva EPS (Contributivo)",                          "regimen": "CONTRIBUTIVO", "activo": True},
    {"codigo": "EPSS41", "nit": "900156265", "nombre": "Nueva EPS (Subsidiado)",                            "regimen": "SUBSIDIADO",   "activo": True},
    {"codigo": "ESS207", "nit": "806008394", "nombre": "Mutual Ser EPS (Subsidiado)",                       "regimen": "SUBSIDIADO",   "activo": True},
    {"codigo": "EPS048", "nit": "806008395", "nombre": "Mutual Ser EPS (Contributivo)",                     "regimen": "CONTRIBUTIVO", "activo": True},
    # ── CONTRIBUTIVO ─────────────────────────────────────────
    {"codigo": "EPS001", "nit": "830113831", "nombre": "Aliansalud EPS",                                    "regimen": "CONTRIBUTIVO", "activo": True},
    {"codigo": "EPS002", "nit": "800130907", "nombre": "Salud Total EPS S.A.",                              "regimen": "CONTRIBUTIVO", "activo": True},
    {"codigo": "EPS005", "nit": "800251440", "nombre": "EPS Sanitas",                                       "regimen": "CONTRIBUTIVO", "activo": True},
    {"codigo": "EPS010", "nit": "800088702", "nombre": "EPS Sura",                                          "regimen": "CONTRIBUTIVO", "activo": True},
    {"codigo": "EPS017", "nit": "830003564", "nombre": "Famisanar EPS",                                     "regimen": "CONTRIBUTIVO", "activo": True},
    {"codigo": "EPS018", "nit": "805001157", "nombre": "Servicio Occidental de Salud EPS SOS",              "regimen": "CONTRIBUTIVO", "activo": True},
    {"codigo": "EPS046", "nit": "900914254", "nombre": "Salud MIA EPS",                                     "regimen": "CONTRIBUTIVO", "activo": True},
    {"codigo": "EPS012", "nit": "890303093", "nombre": "Comfenalco Valle EPS",                              "regimen": "CONTRIBUTIVO", "activo": True},
    {"codigo": "EPS008", "nit": "860066942", "nombre": "Compensar EPS",                                     "regimen": "CONTRIBUTIVO", "activo": True},
    {"codigo": "EPS047", "nit": "901438242", "nombre": "Salud Bolivar EPS SAS",                             "regimen": "CONTRIBUTIVO", "activo": True},
    {"codigo": "EAS016", "nit": "890904996", "nombre": "EPM - Empresas Publicas de Medellin",               "regimen": "CONTRIBUTIVO", "activo": True},
    {"codigo": "EAS027", "nit": "800112806", "nombre": "Fondo de Pasivo Social Ferrocarriles Nacionales",   "regimen": "CONTRIBUTIVO", "activo": True},
    # ── SUBSIDIADO ───────────────────────────────────────────
    {"codigo": "CCF055", "nit": "890102044", "nombre": "Cajacopi Atlantico EPS",                            "regimen": "SUBSIDIADO",   "activo": True},
    {"codigo": "EPS025", "nit": "891856000", "nombre": "Capresoca EPS",                                     "regimen": "SUBSIDIADO",   "activo": True},
    {"codigo": "CCF102", "nit": "891600091", "nombre": "Comfachoco EPS",                                    "regimen": "SUBSIDIADO",   "activo": True},
    {"codigo": "CCF050", "nit": "890500675", "nombre": "Comfaoriente EPS",                                  "regimen": "SUBSIDIADO",   "activo": True},
    {"codigo": "CCF033", "nit": "901543761", "nombre": "EPS Familiar de Colombia",                          "regimen": "SUBSIDIADO",   "activo": True},
    {"codigo": "ESS062", "nit": "900935126", "nombre": "Asmet Salud EPS",                                   "regimen": "SUBSIDIADO",   "activo": True},
    {"codigo": "ESS118", "nit": "901021565", "nombre": "Emssanar E.S.S.",                                   "regimen": "SUBSIDIADO",   "activo": True},
    {"codigo": "EPSS34", "nit": "900298372", "nombre": "Capital Salud EPS-S",                               "regimen": "SUBSIDIADO",   "activo": True},
    {"codigo": "EPSS40", "nit": "900604350", "nombre": "Savia Salud EPS",                                   "regimen": "SUBSIDIADO",   "activo": True},
    {"codigo": "EPSI01", "nit": "824001398", "nombre": "Dusakawi EPSI",                                     "regimen": "SUBSIDIADO",   "activo": True},
    {"codigo": "EPSI03", "nit": "817001773", "nombre": "Asociacion Indigena del Cauca EPSI",                "regimen": "SUBSIDIADO",   "activo": True},
    {"codigo": "EPSI04", "nit": "839000495", "nombre": "Anas Wayuu EPSI",                                   "regimen": "SUBSIDIADO",   "activo": True},
    {"codigo": "EPSI05", "nit": "837000084", "nombre": "Mallamas EPSI",                                     "regimen": "SUBSIDIADO",   "activo": True},
    {"codigo": "EPSI06", "nit": "809008362", "nombre": "Pijaos Salud EPSI",                                 "regimen": "SUBSIDIADO",   "activo": True},
    # ── ESPECIAL ─────────────────────────────────────────────
    {"codigo": "RES001", "nit": "830114626", "nombre": "Direccion General de Sanidad Militar - FFMM",       "regimen": "ESPECIAL",     "activo": True},
    {"codigo": "POL001", "nit": "899999000", "nombre": "Policia Nacional - Sanidad",                        "regimen": "ESPECIAL",     "activo": True},
    {"codigo": "RES002", "nit": "899999046", "nombre": "Ecopetrol S.A.",                                    "regimen": "ESPECIAL",     "activo": True},
    {"codigo": "RES004", "nit": "899999116", "nombre": "Magisterio - FOMAG (Fiduprevisora)",                "regimen": "ESPECIAL",     "activo": True},
]
