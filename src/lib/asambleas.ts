import { db } from './db';
import { dataPath, readJson, writeJson } from './persistence';
import { getDatabaseUrl, requireDatabase } from './env';

export type AssemblyDoc = { label: string; href: string };

export type AssemblyMeeting = {
  id: number;
  title: string;
  date: string;
  location: string;
  status: string;
  agenda: string;
  documents: AssemblyDoc[];
  isPrivate: boolean;
};

export type AssemblyAttendance = {
  meetingId: number;
  userId: number;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

const hasDatabase = Boolean(getDatabaseUrl());
const FILE_MEETINGS = dataPath('assembly_meetings.json');
const FILE_ATTENDANCE = dataPath('assembly_attendance.json');

function assertDbReady() {
  if (requireDatabase() && !hasDatabase) {
    throw new Error('REQUIRE_DB is enabled but DATABASE_URL is missing/invalid.');
  }
}

export async function listAssemblyMeetings() {
  assertDbReady();
  if (!hasDatabase) return readJson<AssemblyMeeting[]>(FILE_MEETINGS, []);
  const res = await db.query(
    `SELECT id,
            title,
            meeting_date::text as date,
            location,
            status,
            agenda,
            documents,
            is_private as "isPrivate"
     FROM assembly_meetings
     ORDER BY meeting_date DESC, id DESC`
  );
  return res.rows.map((r: any) => ({
    id: Number(r.id),
    title: String(r.title ?? ''),
    date: String(r.date ?? ''),
    location: String(r.location ?? ''),
    status: String(r.status ?? 'Programada'),
    agenda: String(r.agenda ?? ''),
    documents: Array.isArray(r.documents) ? r.documents : [],
    isPrivate: Boolean(r.isPrivate)
  })) as AssemblyMeeting[];
}

export async function upsertAssemblyMeetings(input: AssemblyMeeting[]) {
  assertDbReady();
  if (!hasDatabase) {
    await writeJson(FILE_MEETINGS, input);
    return;
  }

  await db.query('DELETE FROM assembly_meetings');
  for (const item of input) {
    await db.query(
      `INSERT INTO assembly_meetings (title, meeting_date, location, status, agenda, documents, is_private)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        item.title,
        item.date || null,
        item.location ?? '',
        item.status ?? 'Programada',
        item.agenda ?? '',
        JSON.stringify(item.documents ?? []),
        Boolean(item.isPrivate)
      ]
    );
  }
}

export async function registerAssemblyAttendance(input: {
  meetingId: number;
  userId: number;
  status: string;
  notes?: string;
}) {
  assertDbReady();
  const now = new Date().toISOString();
  if (!hasDatabase) {
    const list = await readJson<AssemblyAttendance[]>(FILE_ATTENDANCE, []);
    const idx = list.findIndex((x) => x.meetingId === input.meetingId && x.userId === input.userId);
    const next: AssemblyAttendance = {
      meetingId: input.meetingId,
      userId: input.userId,
      status: input.status,
      notes: input.notes ?? '',
      createdAt: idx >= 0 ? list[idx].createdAt : now,
      updatedAt: now
    };
    if (idx >= 0) list[idx] = next;
    else list.unshift(next);
    await writeJson(FILE_ATTENDANCE, list);
    return next;
  }

  const res = await db.query(
    `INSERT INTO assembly_attendance (meeting_id, user_id, status, notes)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (meeting_id, user_id)
     DO UPDATE SET status = EXCLUDED.status,
                   notes = EXCLUDED.notes,
                   updated_at = NOW()
     RETURNING meeting_id as "meetingId",
               user_id as "userId",
               status,
               notes,
               created_at as "createdAt",
               updated_at as "updatedAt"`,
    [input.meetingId, input.userId, input.status, input.notes ?? '']
  );
  return res.rows[0] as AssemblyAttendance;
}

export async function listAttendanceByUser(userId: number) {
  assertDbReady();
  if (!hasDatabase) {
    const all = await readJson<AssemblyAttendance[]>(FILE_ATTENDANCE, []);
    return all.filter((x) => x.userId === userId);
  }
  const res = await db.query(
    `SELECT meeting_id as "meetingId",
            user_id as "userId",
            status,
            notes,
            created_at as "createdAt",
            updated_at as "updatedAt"
     FROM assembly_attendance
     WHERE user_id = $1`,
    [userId]
  );
  return res.rows as AssemblyAttendance[];
}

export async function summarizeAssemblyAttendance() {
  assertDbReady();
  if (!hasDatabase) {
    const all = await readJson<AssemblyAttendance[]>(FILE_ATTENDANCE, []);
    const total = all.length;
    const byStatus = new Map<string, number>();
    for (const row of all) byStatus.set(row.status, (byStatus.get(row.status) ?? 0) + 1);
    return { total, byStatus: Array.from(byStatus.entries()).map(([status, count]) => ({ status, count })) };
  }
  const totalRes = await db.query(`SELECT COUNT(*)::int as total FROM assembly_attendance`);
  const statusRes = await db.query(
    `SELECT status, COUNT(*)::int as count
     FROM assembly_attendance
     GROUP BY status
     ORDER BY count DESC`
  );
  return {
    total: Number(totalRes.rows[0]?.total ?? 0),
    byStatus: statusRes.rows.map((r: any) => ({ status: String(r.status), count: Number(r.count) }))
  };
}

export async function summarizeAssemblyMeetings() {
  assertDbReady();

  if (!hasDatabase) {
    const meetings = await readJson<AssemblyMeeting[]>(FILE_MEETINGS, []);
    const attendance = await readJson<AssemblyAttendance[]>(FILE_ATTENDANCE, []);
    return meetings.map((m) => {
      const rows = attendance.filter((a) => a.meetingId === m.id);
      const total = rows.length;
      const asistio = rows.filter((r) => r.status === 'asistio').length;
      const excusa = rows.filter((r) => r.status === 'excusa').length;
      const ausente = rows.filter((r) => r.status === 'ausente').length;
      const quorum = total > 0 ? Math.round((asistio / total) * 100) : 0;
      return {
        meetingId: m.id,
        title: m.title,
        date: m.date,
        total,
        asistio,
        excusa,
        ausente,
        quorum
      };
    });
  }

  const res = await db.query(
    `SELECT m.id as "meetingId",
            m.title as title,
            m.meeting_date::text as date,
            COUNT(a.id)::int as total,
            COUNT(*) FILTER (WHERE a.status = 'asistio')::int as asistio,
            COUNT(*) FILTER (WHERE a.status = 'excusa')::int as excusa,
            COUNT(*) FILTER (WHERE a.status = 'ausente')::int as ausente
     FROM assembly_meetings m
     LEFT JOIN assembly_attendance a ON a.meeting_id = m.id
     GROUP BY m.id, m.title, m.meeting_date
     ORDER BY m.meeting_date DESC, m.id DESC`
  );

  return res.rows.map((r: any) => {
    const total = Number(r.total || 0);
    const asistio = Number(r.asistio || 0);
    return {
      meetingId: Number(r.meetingId),
      title: String(r.title),
      date: String(r.date),
      total,
      asistio,
      excusa: Number(r.excusa || 0),
      ausente: Number(r.ausente || 0),
      quorum: total > 0 ? Math.round((asistio / total) * 100) : 0
    };
  });
}
