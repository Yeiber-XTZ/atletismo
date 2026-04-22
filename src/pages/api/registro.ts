import type { APIRoute } from 'astro';
import { z } from 'zod';
import { dataPath, generateRadicado, readJson, writeJson } from '../../lib/persistence';
import { createRadicado } from '../../lib/radicados';
import { getDb } from '../../lib/db';
import { saveFileUpload } from '../../lib/file-upload';
import { hashPassword } from '../../lib/security';

const profileSchema = z.enum(['atleta', 'club', 'usuario']);

const schema = z.object({
  profile: profileSchema,
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(160)
});

const athleteSchema = schema
  .extend({
    profile: z.literal('atleta'),
    documentType: z.enum(['CC', 'TI', 'CE']),
    document: z.string().trim().min(6).max(30).regex(/^[0-9-]+$/),
    birthdate: z.string().min(8).max(20),
    sex: z.enum(['F', 'M', 'X']),
    municipality: z.string().trim().min(2).max(120),
    club: z.string().trim().min(2).max(160),
    coach: z.string().trim().min(2).max(160),
    eps: z.string().trim().min(2).max(120),
    emergency: z.string().trim().min(4).max(220),
    marks: z.string().max(4000).optional(),
    password: z.string().min(8).max(200),
    consent: z.literal('yes'),
    disciplineNames: z.array(z.string().trim()).default([]),
    disciplineBests: z.array(z.string().trim()).default([])
  })
  .superRefine((value, ctx) => {
    const validDisciplineCount = value.disciplineNames.filter(Boolean).length;
    if (validDisciplineCount === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes registrar al menos una prueba/especialidad.'
      });
    }
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

const userSchema = schema.extend({
  profile: z.literal('usuario'),
  password: z.string().min(8).max(200)
});

function errorRedirectWithMessage(profile: string, requestUrl: string, message: string) {
  const base = ['atleta', 'club', 'usuario'].includes(profile) ? `/registro/${profile}` : '/registro';
  const url = new URL(base, requestUrl);
  url.searchParams.set('error', 'invalid');
  url.searchParams.set('message', message.slice(0, 220));
  return Response.redirect(url, 302);
}

type BasePayload = z.infer<typeof schema>;
type AthletePayload = z.infer<typeof athleteSchema>;
type ClubPayload = z.infer<typeof clubSchema>;
type UserPayload = z.infer<typeof userSchema>;

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
    return errorRedirectWithMessage(profile, request.url, parsedBase.error.issues[0]?.message ?? 'Datos inválidos');
  }

  let validatedProfilePayload: AthletePayload | ClubPayload | UserPayload;

  if (profile === 'atleta') {
    const athleteParsed = athleteSchema.safeParse({
      ...parsedBase.data,
      documentType: String(form.get('documentType') ?? '').trim(),
      document: String(form.get('document') ?? '').trim(),
      birthdate: String(form.get('birthdate') ?? '').trim(),
      sex: String(form.get('sex') ?? '').trim(),
      municipality: String(form.get('municipality') ?? '').trim(),
      club: String(form.get('club') ?? '').trim(),
      coach: String(form.get('coach') ?? '').trim(),
      eps: String(form.get('eps') ?? '').trim(),
      emergency: String(form.get('emergency') ?? '').trim(),
      marks: String(form.get('marks') ?? '').trim(),
      password: String(form.get('password') ?? ''),
      consent: String(form.get('consent') ?? '').trim(),
      disciplineNames: form.getAll('discipline_name[]').map((item) => String(item ?? '').trim()),
      disciplineBests: form.getAll('discipline_best[]').map((item) => String(item ?? '').trim())
    });
    if (!athleteParsed.success) {
      return errorRedirectWithMessage(profile, request.url, athleteParsed.error.issues[0]?.message ?? 'Datos de atleta inválidos');
    }
    validatedProfilePayload = athleteParsed.data;
  } else if (profile === 'club') {
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
      return errorRedirectWithMessage(profile, request.url, clubParsed.error.issues[0]?.message ?? 'Datos de club inválidos');
    }
    validatedProfilePayload = clubParsed.data;
  } else {
    const userParsed = userSchema.safeParse({
      ...parsedBase.data,
      password: String(form.get('password') ?? '')
    });
    if (!userParsed.success) {
      return errorRedirectWithMessage(profile, request.url, userParsed.error.issues[0]?.message ?? 'Datos de usuario inválidos');
    }
    validatedProfilePayload = userParsed.data;
  }

  const data: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (key === 'profile' || key === 'name' || key === 'email') continue;
    if (key === 'password') continue;
    if (typeof value === 'string') data[key] = value;
  }

  if (profile === 'atleta') {
    data.disciplines = (validatedProfilePayload as AthletePayload).disciplineNames.filter(Boolean).join(' | ');
  }

  if (profile === 'club') {
    const logoFile = form.get('logoFile');
    if (logoFile instanceof File && logoFile.size > 0) {
      const logoUrl = await saveFileUpload(logoFile, null, { isPrivate: false });
      if (logoUrl) data.logoFileUrl = logoUrl;
    }
  }

  const plainPassword = (validatedProfilePayload as AthletePayload | ClubPayload | UserPayload).password;
  data.passwordHash = hashPassword(plainPassword);

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

  // If atleta, also store/update athlete record in DB.
  if (profile === 'atleta') {
    try {
      const db = await getDb();
      if (db) {
        const athletePayload = validatedProfilePayload as AthletePayload;
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ');

        const athleteResult = await db.query(
          `INSERT INTO athletes (first_name, last_name, gender, birthdate, document, document_type, municipality, email, club, coach, eps, emergency_contact, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active')
           ON CONFLICT (document) DO UPDATE
           SET first_name = $1,
               last_name = $2,
               gender = $3,
               birthdate = $4,
               document_type = $6,
               municipality = $7,
               email = $8,
               club = $9,
               coach = $10,
               eps = $11,
               emergency_contact = $12,
               updated_at = NOW()
           RETURNING id`,
          [
            firstName,
            lastName,
            athletePayload.sex,
            athletePayload.birthdate || null,
            athletePayload.document,
            athletePayload.documentType,
            athletePayload.municipality,
            email,
            athletePayload.club,
            athletePayload.coach,
            athletePayload.eps,
            athletePayload.emergency
          ]
        );

        if (athleteResult.rows.length > 0) {
          const athleteId = athleteResult.rows[0].id;

          const disciplineNames = athletePayload.disciplineNames;
          const disciplineBests = athletePayload.disciplineBests;

          for (let i = 0; i < disciplineNames.length; i++) {
            const disciplineName = String(disciplineNames[i] ?? '').trim();
            const personalBest = String(disciplineBests[i] ?? '').trim();

            if (!disciplineName) continue;
            await db.query(
              `INSERT INTO athlete_disciplines (athlete_id, discipline, personal_best)
               VALUES ($1, $2, $3)
               ON CONFLICT (athlete_id, discipline) DO UPDATE
               SET personal_best = $3, updated_at = NOW()`,
              [athleteId, disciplineName, personalBest || null]
            );
          }

          await db.query(
            `UPDATE radicados
             SET athlete_id = $1, athlete_document = $2
             WHERE radicado = $3`,
            [athleteId, athletePayload.document, radicado]
          );
        }
      }
    } catch (error) {
      console.error('Error saving athlete to DB:', error);
      // Continue even if DB write fails. The radicado was already created.
    }
  }

  return Response.redirect(
    new URL(`/registro/${encodeURIComponent(item.profile)}?success=1&radicado=${encodeURIComponent(radicado)}`, request.url),
    302
  );
};
