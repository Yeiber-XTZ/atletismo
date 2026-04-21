import { db } from './db';
import { getDatabaseUrl, requireDatabase } from './env';

const hasDatabase = Boolean(getDatabaseUrl());

export type AdminAlert = {
  type: 'convocatoria' | 'pqrs' | 'postulation';
  level: 'warning' | 'critical' | 'info';
  title: string;
  detail: string;
  href: string;
};

function daysBetween(from: Date, to: Date) {
  const ms = to.getTime() - from.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export async function getAdminAlerts(): Promise<AdminAlert[]> {
  if (requireDatabase() && !hasDatabase) {
    throw new Error('REQUIRE_DB is enabled but DATABASE_URL is missing/invalid.');
  }
  if (!hasDatabase) return [];

  const alerts: AdminAlert[] = [];
  const now = new Date();

  const convocatoriasRes = await db.query(
    `SELECT title, close_date::text as "closeDate", status
     FROM convocatorias
     WHERE close_date IS NOT NULL`
  );

  for (const row of convocatoriasRes.rows as Array<{ title: string; closeDate: string; status: string }>) {
    const closeDate = new Date(`${row.closeDate}T23:59:59`);
    const days = daysBetween(now, closeDate);
    if (days < 0) continue;
    if (days <= 3) {
      alerts.push({
        type: 'convocatoria',
        level: days <= 1 ? 'critical' : 'warning',
        title: `Convocatoria por vencer: ${row.title}`,
        detail: `Cierra en ${days} día(s).`,
        href: '/admin?tab=convocatorias'
      });
    }
  }

  const pqrsRes = await db.query(
    `SELECT radicado, created_at
     FROM pqrs_requests
     WHERE status IN ('PENDIENTE','EN TRAMITE')`
  );

  for (const row of pqrsRes.rows as Array<{ radicado: string; created_at: string }>) {
    const created = new Date(row.created_at);
    const age = daysBetween(created, now);
    if (age >= 5) {
      alerts.push({
        type: 'pqrs',
        level: age >= 10 ? 'critical' : 'warning',
        title: `PQRS pendiente: ${row.radicado}`,
        detail: `${age} día(s) sin cierre.`,
        href: '/admin?tab=pqrs'
      });
    }
  }

  const postRes = await db.query(
    `SELECT id, status, updated_at
     FROM postulations
     WHERE status IN ('Postulada','En revisión','Incompleta')`
  );

  for (const row of postRes.rows as Array<{ id: string; status: string; updated_at: string }>) {
    const updated = new Date(row.updated_at);
    const age = daysBetween(updated, now);
    if (age >= 4) {
      alerts.push({
        type: 'postulation',
        level: age >= 8 ? 'critical' : 'warning',
        title: `Postulación estancada: ${row.id}`,
        detail: `${age} día(s) en estado "${row.status}".`,
        href: '/admin?tab=convocatorias'
      });
    }
  }

  return alerts.sort((a, b) => {
    const score = (x: AdminAlert) => (x.level === 'critical' ? 2 : x.level === 'warning' ? 1 : 0);
    return score(b) - score(a);
  });
}
