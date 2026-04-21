import { db } from './db';
import { getDatabaseUrl, requireDatabase } from './env';
import type { Role } from './rbac';

const hasDatabase = Boolean(getDatabaseUrl());

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  level: string;
  targetRole: Role | 'ALL';
  actionHref: string;
  isActive: boolean;
  createdAt: string;
};

function assertDbReady() {
  if (requireDatabase() && !hasDatabase) {
    throw new Error('REQUIRE_DB is enabled but DATABASE_URL is missing/invalid.');
  }
}

export async function listNotifications() {
  assertDbReady();
  if (!hasDatabase) return [] as NotificationItem[];
  const res = await db.query(
    `SELECT id,
            title,
            message,
            level,
            target_role as "targetRole",
            action_href as "actionHref",
            is_active as "isActive",
            created_at as "createdAt"
     FROM notifications
     ORDER BY created_at DESC`
  );
  return res.rows as NotificationItem[];
}

export async function createNotification(input: {
  title: string;
  message: string;
  level: string;
  targetRole: Role | 'ALL';
  actionHref?: string;
}) {
  assertDbReady();
  if (!hasDatabase) return;
  await db.query(
    `INSERT INTO notifications (title, message, level, target_role, action_href, is_active)
     VALUES ($1,$2,$3,$4,$5,TRUE)`,
    [input.title, input.message, input.level, input.targetRole, input.actionHref ?? '']
  );
}

export async function setNotificationActive(id: number, isActive: boolean) {
  assertDbReady();
  if (!hasDatabase) return;
  await db.query(`UPDATE notifications SET is_active=$1, updated_at=NOW() WHERE id=$2`, [isActive, id]);
}

export async function listNotificationsForRole(role: Role | 'PUBLICO') {
  assertDbReady();
  if (!hasDatabase) return [] as NotificationItem[];
  const res = await db.query(
    `SELECT id,
            title,
            message,
            level,
            target_role as "targetRole",
            action_href as "actionHref",
            is_active as "isActive",
            created_at as "createdAt"
     FROM notifications
     WHERE is_active = TRUE
       AND (target_role = 'ALL' OR target_role = $1 OR target_role = 'PUBLICO')
     ORDER BY created_at DESC
     LIMIT 12`,
    [role]
  );
  return res.rows as NotificationItem[];
}

