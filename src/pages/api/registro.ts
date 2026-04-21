import type { APIRoute } from 'astro';
import { z } from 'zod';
import { dataPath, generateRadicado, readJson, writeJson } from '../../lib/persistence';
import { createRadicado } from '../../lib/radicados';
import { getDb } from '../../lib/db';

const schema = z.object({
  profile: z.enum(['atleta', 'club', 'usuario']),
  name: z.string().min(2).max(160),
  email: z.string().email().max(160)
});

type RegistrationItem = z.infer<typeof schema> & {
  radicado: string;
  createdAt: string;
  data: Record<string, string>;
};

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const profile = String(form.get('profile') ?? '');
  const name = String(form.get('name') ?? '');
  const email = String(form.get('email') ?? '');

  const parsed = schema.safeParse({ profile, name, email });
  if (!parsed.success) {
    return Response.redirect(new URL('/registro?error=invalid', request.url), 302);
  }

  const data: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (key === 'profile' || key === 'name' || key === 'email') continue;
    if (typeof value === 'string') data[key] = value;
  }

  const radicado = generateRadicado('REG');
  const item: RegistrationItem = {
    ...parsed.data,
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

  // Si es atleta, guardar en la BD también
  if (profile === 'atleta') {
    try {
      const db = await getDb();
      if (db) {
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ');
        const document = String(form.get('document') ?? '');
        const birthdate = String(form.get('birthdate') ?? null);
        const sex = String(form.get('sex') ?? null);
        const municipality = String(form.get('municipality') ?? '');

        // Crear o actualizar atleta
        const athleteResult = await db.query(
          `INSERT INTO athletes (first_name, last_name, gender, birthdate, document, municipality, email, club, coach, eps, emergency_contact, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active')
           ON CONFLICT (document) DO UPDATE 
           SET last_name = $2, gender = $3, birthdate = $4, municipality = $6, email = $7, club = $8, coach = $9, eps = $10, emergency_contact = $11, updated_at = NOW()
           RETURNING id`,
          [firstName, lastName, sex, birthdate, document, municipality, email, form.get('club'), form.get('coach'), form.get('eps'), form.get('emergency')]
        );

        if (athleteResult.rows.length > 0) {
          const athleteId = athleteResult.rows[0].id;

          // Procesar disciplinas dinámicas
          const disciplineNames = form.getAll('discipline_name[]');
          const disciplineBests = form.getAll('discipline_best[]');

          for (let i = 0; i < disciplineNames.length; i++) {
            const disciplineName = String(disciplineNames[i] ?? '').trim();
            const personalBest = String(disciplineBests[i] ?? '').trim();

            if (disciplineName) {
              await db.query(
                `INSERT INTO athlete_disciplines (athlete_id, discipline, personal_best)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (athlete_id, discipline) DO UPDATE 
                 SET personal_best = $3, updated_at = NOW()`,
                [athleteId, disciplineName, personalBest || null]
              );
            }
          }

          // Actualizar radicado con athlete_id y documento
          await db.query(
            `UPDATE radicados 
             SET athlete_id = $1, athlete_document = $2 
             WHERE radicado = $3`,
            [athleteId, document, radicado]
          );
        }
      }
    } catch (error) {
      console.error('Error saving athlete to DB:', error);
      // Continuar aunque falle la BD, el radicado ya se creó
    }
  }

  return Response.redirect(
    new URL(`/registro/exito?radicado=${encodeURIComponent(radicado)}&perfil=${encodeURIComponent(item.profile)}`, request.url),
    302
  );
};
