import type { APIRoute } from 'astro';
import { z } from 'zod';
import { dataPath, generateRadicado, readJson, writeJson } from '../../lib/persistence';
import { createRadicado } from '../../lib/radicados';
import { saveFileUpload } from '../../lib/file-upload';
import { hashPassword } from '../../lib/security';

const profileSchema = z.literal('club');

const schema = z.object({
  profile: profileSchema,
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(160)
});

const clubSchema = schema.extend({
  profile: z.literal('club'),
  phone: z.string().trim().regex(/^[0-9+\-\s()]{7,20}$/),
  municipality: z.string().trim().min(2).max(120),
  nit: z.string().trim().regex(/^[0-9-]{5,20}$/).optional().or(z.literal('')),
  legalRepresentative: z.string().trim().min(3).max(180),
  recognitionDoc: z.string().trim().max(300).optional(),
  documents: z.string().max(6000).optional(),
  password: z.string().min(8).max(200)
});

function errorRedirectWithMessage(requestUrl: string, message: string) {
  const url = new URL('/registro/club', requestUrl);
  url.searchParams.set('error', 'invalid');
  url.searchParams.set('message', message.slice(0, 220));
  return Response.redirect(url, 302);
}

type BasePayload = z.infer<typeof schema>;
type ClubPayload = z.infer<typeof clubSchema>;

type RegistrationItem = BasePayload & {
  radicado: string;
  createdAt: string;
  data: Record<string, string>;
};

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const profile = String(form.get('profile') ?? '');
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();

  const parsedBase = schema.safeParse({ profile, name, email });
  if (!parsedBase.success) {
    return errorRedirectWithMessage(request.url, parsedBase.error.issues[0]?.message ?? 'Datos inválidos');
  }

  const clubParsed = clubSchema.safeParse({
    ...parsedBase.data,
    phone: String(form.get('phone') ?? '').trim(),
    municipality: String(form.get('municipality') ?? '').trim(),
    nit: String(form.get('nit') ?? '').trim(),
    legalRepresentative: String(form.get('legalRepresentative') ?? '').trim(),
    recognitionDoc: String(form.get('recognitionDoc') ?? '').trim(),
    documents: String(form.get('documents') ?? '').trim(),
    password: String(form.get('password') ?? '')
  });
  if (!clubParsed.success) {
    return errorRedirectWithMessage(request.url, clubParsed.error.issues[0]?.message ?? 'Datos de club inválidos');
  }
  const validatedProfilePayload: ClubPayload = clubParsed.data;

  const data: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (key === 'profile' || key === 'name' || key === 'email') continue;
    if (key === 'password') continue;
    if (typeof value === 'string') data[key] = value;
  }

  const logoFile = form.get('logoFile');
  if (logoFile instanceof File && logoFile.size > 0) {
    const logoUrl = await saveFileUpload(logoFile, null, { isPrivate: false });
    if (logoUrl) data.logoFileUrl = logoUrl;
  }

  data.passwordHash = hashPassword(validatedProfilePayload.password);

  const radicado = generateRadicado('REG');
  const item: RegistrationItem = {
    ...parsedBase.data,
    radicado,
    createdAt: new Date().toISOString(),
    data
  };

  const file = dataPath('registrations.json');
  const list = await readJson<RegistrationItem[]>(file, []);
  list.unshift(item);
  await writeJson(file, list);

  await createRadicado({
    radicado,
    profile: item.profile,
    name: item.name,
    email: item.email,
    payload: item.data
  });

  return Response.redirect(new URL(`/registro/club?success=1&radicado=${encodeURIComponent(radicado)}`, request.url), 302);
};
