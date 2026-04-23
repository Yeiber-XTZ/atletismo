import { db } from './db';
import { getDatabaseUrl } from './env';

export type CatalogSex = { code: string; name: string };
export type CatalogCountry = { iso2: string; name: string; shortName: string };
export type CatalogDepartment = { code: string; countryIso2: string; name: string };
export type CatalogMunicipality = { code: string; departmentCode: string; name: string };
export type CatalogAthleticsDiscipline = { name: string };
export type CatalogAthleticsEvent = { name: string; shortName: string; disciplineName: string; gender: string; unit: string };

const hasDatabase = Boolean(getDatabaseUrl());

export async function listSexCatalog(): Promise<CatalogSex[]> {
  if (!hasDatabase) {
    return [];
  }
  try {
    const res = await db.query(
      `SELECT code, name
       FROM catalog_sexes
       WHERE is_active = TRUE
       ORDER BY sort_order ASC, name ASC`
    );
    return res.rows.map((row: any) => ({ code: String(row.code), name: String(row.name) }));
  } catch {
    return [];
  }
}

export async function listGeoCatalogs() {
  if (!hasDatabase) {
    return { countries: [], departments: [], municipalities: [] };
  }

  try {
    const [countriesRes, departmentsRes, municipalitiesRes] = await Promise.all([
      db.query(
        `SELECT iso2, name, short_name AS "shortName"
         FROM catalog_countries
         WHERE is_active = TRUE
         ORDER BY sort_order ASC, short_name ASC`
      ),
      db.query(
        `SELECT code, country_iso2 AS "countryIso2", name
         FROM catalog_departments
         WHERE is_active = TRUE
         ORDER BY sort_order ASC, name ASC`
      ),
      db.query(
        `SELECT code, department_code AS "departmentCode", name
         FROM catalog_municipalities
         WHERE is_active = TRUE
         ORDER BY sort_order ASC, name ASC`
      )
    ]);

    return {
      countries: countriesRes.rows.map((row: any) => ({
        iso2: String(row.iso2),
        name: String(row.name),
        shortName: String(row.shortName ?? row.name)
      })),
      departments: departmentsRes.rows.map((row: any) => ({
        code: String(row.code),
        countryIso2: String(row.countryIso2),
        name: String(row.name)
      })),
      municipalities: municipalitiesRes.rows.map((row: any) => ({
        code: String(row.code),
        departmentCode: String(row.departmentCode),
        name: String(row.name)
      }))
    };
  } catch {
    return { countries: [], departments: [], municipalities: [] };
  }
}

export async function listAthleticsCatalogs() {
  if (!hasDatabase) {
    return { disciplines: [], events: [] };
  }

  try {
    const [disciplinesRes, eventsRes] = await Promise.all([
      db.query(
        `SELECT name
         FROM sport_disciplines
         WHERE sport_code = 'ATHLETICS'
         ORDER BY sort_order ASC, name ASC`
      ),
      db.query(
        `SELECT name,
                COALESCE(short_name, '') AS "shortName",
                discipline_name AS "disciplineName",
                gender,
                unit
         FROM sport_events
         WHERE sport_code = 'ATHLETICS'
         ORDER BY sort_order ASC, name ASC`
      )
    ]);

    return {
      disciplines: disciplinesRes.rows.map((row: any) => ({ name: String(row.name) })),
      events: eventsRes.rows.map((row: any) => ({
        name: String(row.name),
        shortName: String(row.shortName ?? ''),
        disciplineName: String(row.disciplineName ?? ''),
        gender: String(row.gender ?? 'TODOS'),
        unit: String(row.unit ?? '')
      }))
    };
  } catch {
    return { disciplines: [], events: [] };
  }
}

export async function findAthleticsEventByName(name: string) {
  const target = String(name ?? '').trim();
  if (!target) return null;

  if (!hasDatabase) {
    return null;
  }

  let res;
  try {
    res = await db.query(
      `SELECT name,
              COALESCE(short_name, '') AS "shortName",
              discipline_name AS "disciplineName",
              gender,
              unit
       FROM sport_events
       WHERE sport_code = 'ATHLETICS'
         AND lower(name) = lower($1)
      LIMIT 1`,
      [target]
    );
  } catch {
    return null;
  }
  if (!res.rows[0]) return null;
  const row = res.rows[0] as any;
  return {
    name: String(row.name),
    shortName: String(row.shortName ?? ''),
    disciplineName: String(row.disciplineName ?? ''),
    gender: String(row.gender ?? 'TODOS'),
    unit: String(row.unit ?? '')
  };
}
