import fs from 'node:fs/promises';
import path from 'node:path';
import { db } from './db';
import { getDatabaseUrl } from './env';

export type CatalogSex = { code: string; name: string };
export type CatalogCountry = { iso2: string; name: string; shortName: string };
export type CatalogDepartment = { code: string; countryIso2: string; name: string };
export type CatalogMunicipality = { code: string; departmentCode: string; name: string };
export type CatalogAthleticsDiscipline = { name: string };
export type CatalogAthleticsEvent = { name: string; shortName: string; disciplineName: string; gender: string; unit: string };

const hasDatabase = Boolean(getDatabaseUrl());
const CATALOGS_DIR = path.join(process.cwd(), 'scripts', 'catalogs');

async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(CATALOGS_DIR, filename), 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function listSexCatalog(): Promise<CatalogSex[]> {
  if (!hasDatabase) {
    const data = await readJsonFile<any>('geo-sex-catalogs.json', {});
    return (Array.isArray(data.sexes) ? data.sexes : [])
      .map((item: any) => ({ code: String(item.codigo ?? '').trim(), name: String(item.nombre ?? '').trim() }))
      .filter((item: CatalogSex) => item.code && item.name);
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
    const data = await readJsonFile<any>('geo-sex-catalogs.json', {});
    return (Array.isArray(data.sexes) ? data.sexes : [])
      .map((item: any) => ({ code: String(item.codigo ?? '').trim(), name: String(item.nombre ?? '').trim() }))
      .filter((item: CatalogSex) => item.code && item.name);
  }
}

export async function listGeoCatalogs() {
  if (!hasDatabase) {
    const data = await readJsonFile<any>('geo-sex-catalogs.json', {});
    const countries = (Array.isArray(data.countries) ? data.countries : []).map((item: any) => ({
      iso2: String(item.codigo_iso2 ?? '').trim().toUpperCase(),
      name: String(item.nombre ?? item.nombre_corto ?? '').trim(),
      shortName: String(item.nombre_corto ?? item.nombre ?? '').trim()
    }));
    const departments = (Array.isArray(data.departments_colombia) ? data.departments_colombia : []).map((item: any) => ({
      code: String(item.codigo_dane ?? '').trim(),
      countryIso2: 'CO',
      name: String(item.nombre ?? '').trim()
    }));
    const municipalities = (Array.isArray(data.municipalities_colombia) ? data.municipalities_colombia : [])
      .filter((item: any) => Array.isArray(item) && item.length >= 2)
      .map((item: any) => ({
        code: String(item[0] ?? '').trim(),
        departmentCode: String(item[0] ?? '').trim().slice(0, 2),
        name: String(item[1] ?? '').trim()
      }));
    return { countries, departments, municipalities };
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
    const data = await readJsonFile<any>('geo-sex-catalogs.json', {});
    const countries = (Array.isArray(data.countries) ? data.countries : []).map((item: any) => ({
      iso2: String(item.codigo_iso2 ?? '').trim().toUpperCase(),
      name: String(item.nombre ?? item.nombre_corto ?? '').trim(),
      shortName: String(item.nombre_corto ?? item.nombre ?? '').trim()
    }));
    const departments = (Array.isArray(data.departments_colombia) ? data.departments_colombia : []).map((item: any) => ({
      code: String(item.codigo_dane ?? '').trim(),
      countryIso2: 'CO',
      name: String(item.nombre ?? '').trim()
    }));
    const municipalities = (Array.isArray(data.municipalities_colombia) ? data.municipalities_colombia : [])
      .filter((item: any) => Array.isArray(item) && item.length >= 2)
      .map((item: any) => ({
        code: String(item[0] ?? '').trim(),
        departmentCode: String(item[0] ?? '').trim().slice(0, 2),
        name: String(item[1] ?? '').trim()
      }));
    return { countries, departments, municipalities };
  }
}

export async function listAthleticsCatalogs() {
  if (!hasDatabase) {
    const data = await readJsonFile<any>('atletismo-catalogs.json', {});
    return {
      disciplines: (Array.isArray(data.disciplines) ? data.disciplines : [])
        .map((item: any) => ({ name: String(item.nombre ?? '').trim() }))
        .filter((item: CatalogAthleticsDiscipline) => item.name),
      events: (Array.isArray(data.events) ? data.events : [])
        .map((item: any) => ({
          name: String(item.nombre ?? '').trim(),
          shortName: String(item.nombre_corto ?? '').trim(),
          disciplineName: String(item.disciplina ?? '').trim() || 'General',
          gender: String(item.genero ?? 'TODOS').trim() || 'TODOS',
          unit: String(item.unidad ?? '').trim()
        }))
        .filter((item: CatalogAthleticsEvent) => item.name)
    };
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
    const data = await readJsonFile<any>('atletismo-catalogs.json', {});
    return {
      disciplines: (Array.isArray(data.disciplines) ? data.disciplines : [])
        .map((item: any) => ({ name: String(item.nombre ?? '').trim() }))
        .filter((item: CatalogAthleticsDiscipline) => item.name),
      events: (Array.isArray(data.events) ? data.events : [])
        .map((item: any) => ({
          name: String(item.nombre ?? '').trim(),
          shortName: String(item.nombre_corto ?? '').trim(),
          disciplineName: String(item.disciplina ?? '').trim() || 'General',
          gender: String(item.genero ?? 'TODOS').trim() || 'TODOS',
          unit: String(item.unidad ?? '').trim()
        }))
        .filter((item: CatalogAthleticsEvent) => item.name)
    };
  }
}

export async function findAthleticsEventByName(name: string) {
  const target = String(name ?? '').trim();
  if (!target) return null;

  if (!hasDatabase) {
    const { events } = await listAthleticsCatalogs();
    return events.find((item) => item.name.toLowerCase() === target.toLowerCase()) ?? null;
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
    const { events } = await listAthleticsCatalogs();
    return events.find((item) => item.name.toLowerCase() === target.toLowerCase()) ?? null;
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
