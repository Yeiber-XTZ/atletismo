import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import pg from 'pg';

const { Client } = pg;

function getDatabaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.includes('@HOST:') || trimmed.includes('USER:PASSWORD')) return '';
  return trimmed;
}

const databaseUrl = getDatabaseUrl();
if (!databaseUrl) {
  console.log('Catalog seed skipped (DATABASE_URL missing/placeholder).');
  process.exit(0);
}

const catalogsDir = path.join(process.cwd(), 'scripts', 'catalogs');
const geoFile = path.join(catalogsDir, 'geo-sex-catalogs.json');
const atletismoFile = path.join(catalogsDir, 'atletismo-catalogs.json');

const [geoRaw, atletismoRaw] = await Promise.all([fs.readFile(geoFile, 'utf-8'), fs.readFile(atletismoFile, 'utf-8')]);
const geo = JSON.parse(geoRaw);
const atletismo = JSON.parse(atletismoRaw);

const countries = Array.isArray(geo.countries) ? geo.countries : [];
const departments = Array.isArray(geo.departments_colombia) ? geo.departments_colombia : [];
const municipalities = Array.isArray(geo.municipalities_colombia) ? geo.municipalities_colombia : [];
const sexes = Array.isArray(geo.sexes) ? geo.sexes : [];
const disciplines = Array.isArray(atletismo.disciplines) ? atletismo.disciplines : [];
const events = Array.isArray(atletismo.events) ? atletismo.events : [];

function normalizeDane(value, width) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const digits = raw.replace(/\D+/g, '');
  if (!digits) return '';
  return digits.padStart(width, '0');
}

const client = new Client({ connectionString: databaseUrl });
await client.connect();

try {
  await client.query('BEGIN');

  for (let index = 0; index < sexes.length; index += 1) {
    const item = sexes[index] ?? {};
    const code = String(item.codigo ?? '').trim();
    const name = String(item.nombre ?? '').trim();
    if (!code || !name) continue;
    await client.query(
      `INSERT INTO catalog_sexes (code, name, sort_order, is_active)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (code)
       DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active`,
      [code, name, index + 1, item.activo !== false]
    );
  }

  for (const item of countries) {
    const iso2 = String(item.codigo_iso2 ?? '').trim().toUpperCase();
    if (!iso2) continue;
    await client.query(
      `INSERT INTO catalog_countries (iso2, iso3, code_num, name, short_name, demonym, sort_order, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (iso2)
       DO UPDATE SET iso3 = EXCLUDED.iso3, code_num = EXCLUDED.code_num, name = EXCLUDED.name,
                     short_name = EXCLUDED.short_name, demonym = EXCLUDED.demonym,
                     sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active`,
      [
        iso2,
        String(item.codigo_iso3 ?? '').trim() || null,
        String(item.codigo_num ?? '').trim() || null,
        String(item.nombre ?? '').trim() || String(item.nombre_corto ?? '').trim() || iso2,
        String(item.nombre_corto ?? '').trim() || String(item.nombre ?? '').trim() || iso2,
        String(item.gentilicio ?? '').trim(),
        Number(item.orden ?? 0) || 0,
        item.activo !== false
      ]
    );
  }

  for (let index = 0; index < departments.length; index += 1) {
    const item = departments[index] ?? {};
    const code = normalizeDane(item.codigo_dane, 2);
    if (!code) continue;
    await client.query(
      `INSERT INTO catalog_departments (code, country_iso2, name, sort_order, is_active)
       VALUES ($1,'CO',$2,$3,$4)
       ON CONFLICT (code)
       DO UPDATE SET country_iso2 = EXCLUDED.country_iso2, name = EXCLUDED.name,
                     sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active`,
      [code, String(item.nombre ?? '').trim() || code, index + 1, true]
    );
  }

  const knownDepartmentCodes = new Set(
    departments.map((item) => normalizeDane(item?.codigo_dane, 2)).filter(Boolean)
  );
  const municipalityDepartmentCodes = new Set(
    municipalities
      .filter((item) => Array.isArray(item) && item.length >= 1)
      .map((item) => normalizeDane(String(item[0] ?? '').slice(0, 2), 2))
      .filter(Boolean)
  );
  for (const code of municipalityDepartmentCodes) {
    if (knownDepartmentCodes.has(code)) continue;
    await client.query(
      `INSERT INTO catalog_departments (code, country_iso2, name, sort_order, is_active)
       VALUES ($1,'CO',$2,9999,TRUE)
       ON CONFLICT (code) DO NOTHING`,
      [code, `Departamento ${code}`]
    );
  }

  for (let index = 0; index < municipalities.length; index += 1) {
    const item = municipalities[index];
    if (!Array.isArray(item) || item.length < 3) continue;
    const code = normalizeDane(item[0], 5);
    const name = String(item[1] ?? '').trim();
    const isCapital = Boolean(item[2]);
    if (!code || !name) continue;
    const departmentCode = normalizeDane(code.slice(0, 2), 2);
    await client.query(
      `INSERT INTO catalog_municipalities (code, department_code, name, is_capital, sort_order, is_active)
       VALUES ($1,$2,$3,$4,$5,true)
       ON CONFLICT (code)
       DO UPDATE SET department_code = EXCLUDED.department_code, name = EXCLUDED.name,
                     is_capital = EXCLUDED.is_capital, sort_order = EXCLUDED.sort_order`,
      [code, departmentCode, name, isCapital, index + 1]
    );
  }

  for (let index = 0; index < disciplines.length; index += 1) {
    const item = disciplines[index] ?? {};
    const name = String(item.nombre ?? '').trim();
    if (!name) continue;
    await client.query(
      `INSERT INTO sport_disciplines (sport_code, name, sort_order)
       VALUES ('ATHLETICS', $1, $2)
       ON CONFLICT (sport_code, name)
       DO UPDATE SET sort_order = EXCLUDED.sort_order`,
      [name, index + 1]
    );
  }

  for (let index = 0; index < events.length; index += 1) {
    const item = events[index] ?? {};
    const name = String(item.nombre ?? '').trim();
    if (!name) continue;
    await client.query(
      `INSERT INTO sport_events (sport_code, name, short_name, discipline_name, gender, unit, is_relay, is_team, sort_order)
       VALUES ('ATHLETICS', $1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (sport_code, name)
       DO UPDATE SET short_name = EXCLUDED.short_name, discipline_name = EXCLUDED.discipline_name,
                     gender = EXCLUDED.gender, unit = EXCLUDED.unit, is_relay = EXCLUDED.is_relay,
                     is_team = EXCLUDED.is_team, sort_order = EXCLUDED.sort_order`,
      [
        name,
        String(item.nombre_corto ?? '').trim() || null,
        String(item.disciplina ?? '').trim() || 'General',
        String(item.genero ?? 'TODOS').trim() || 'TODOS',
        String(item.unidad ?? '').trim(),
        Boolean(item.es_relevos),
        Boolean(item.es_prueba_conjunto),
        index + 1
      ]
    );
  }

  await client.query('COMMIT');
  console.log(
    `Catalogs seeded: sexes=${sexes.length}, countries=${countries.length}, departments=${departments.length}, municipalities=${municipalities.length}, disciplines=${disciplines.length}, events=${events.length}`
  );
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
