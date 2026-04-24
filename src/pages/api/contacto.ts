import type { APIRoute } from 'astro';
import { z } from 'zod';
import { dataPath, generateRadicado, readJson, writeJson } from '../../lib/persistence';
import { getDatabaseUrl, requireDatabase } from '../../lib/env';
import { createPqrs } from '../../lib/pqrs';
import { logAudit } from '../../lib/audit';
import { redirectInternal } from '../../lib/http-redirect';

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  type: z.string().min(1).max(40),
  subject: z.string().min(3).max(180),
  message: z.string().min(10).max(5000)
});

type PqrsItem = z.infer<typeof schema> & {
  radicado: string;
  status: 'PENDIENTE' | 'EN TRAMITE' | 'RESUELTO';
  createdAt: string;
};

const hasDatabase = Boolean(getDatabaseUrl());

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const payload = {
    name: String(form.get('name') ?? ''),
    email: String(form.get('email') ?? ''),
    type: String(form.get('type') ?? ''),
    subject: String(form.get('subject') ?? ''),
    message: String(form.get('message') ?? '')
  };

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return redirectInternal('/contacto?error=invalid', 302);
  }

  const radicado = generateRadicado('PQRS');
  const item: PqrsItem = {
    ...parsed.data,
    radicado,
    status: 'PENDIENTE',
    createdAt: new Date().toISOString()
  };

  if (hasDatabase) {
    await createPqrs({
      radicado: item.radicado,
      name: item.name,
      email: item.email,
      type: item.type,
      subject: item.subject,
      message: item.message
    });
  } else {
    if (requireDatabase()) {
      return redirectInternal('/contacto?error=db_required', 302);
    }
    const file = dataPath('pqrs.json');
    const list = await readJson<PqrsItem[]>(file, []);
    list.unshift(item);
    await writeJson(file, list);
  }

  await logAudit({
    userId: null,
    action: 'pqrs_submitted',
    tableName: 'pqrs_requests',
    entityType: 'pqrs',
    entityId: item.radicado,
    meta: { type: item.type, email: item.email },
    request
  });

  return redirectInternal(`/contacto?radicado=${encodeURIComponent(radicado)}`, 302);
};


