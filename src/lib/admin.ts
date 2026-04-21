import { db } from './db';
import { readStore, writeStore, type Store } from './store';
import { getDatabaseUrl, requireDatabase } from './env';
import { onResultInserted } from './rankings';

const hasDatabase = Boolean(getDatabaseUrl());

function assertDbReady() {
  if (requireDatabase() && !hasDatabase) {
    throw new Error('REQUIRE_DB is enabled but DATABASE_URL is missing/invalid.');
  }
}

async function syncOrderedTableById(
  tableName: string,
  count: number,
  run: (rowId: number, client: { query: (text: string, params?: unknown[]) => Promise<any> }) => Promise<void>
) {
  await db.transaction(async (client) => {
    for (let index = 0; index < count; index += 1) {
      await run(index + 1, client);
    }

    if (count > 0) {
      await client.query(`DELETE FROM ${tableName} WHERE id > $1`, [count]);
    } else {
      await client.query(`DELETE FROM ${tableName}`);
    }
  });
}

export async function getAdminData(): Promise<Store> {
  return (await (await import('./content')).getHomeData()) as Store;
}

export async function upsertSettings(input: Store['settings']) {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    store.settings = input;
    await writeStore(store);
    return;
  }

  const latest = await db.query('SELECT id FROM site_settings ORDER BY id DESC LIMIT 1');
  const id = latest.rows[0]?.id as number | undefined;

  if (!id) {
    await db.query(
      `INSERT INTO site_settings
        (site_name, logo_url, primary_color, secondary_color, contact_email, contact_phone, social_links)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        input.siteName,
        input.logoUrl,
        input.primaryColor,
        input.secondaryColor,
        input.contactEmail,
        input.contactPhone,
        JSON.stringify(input.social ?? {})
      ]
    );
    return;
  }

  await db.query(
    `UPDATE site_settings
     SET site_name=$1, logo_url=$2, primary_color=$3, secondary_color=$4, contact_email=$5, contact_phone=$6, social_links=$7, updated_at=NOW()
     WHERE id=$8`,
    [
      input.siteName,
      input.logoUrl,
      input.primaryColor,
      input.secondaryColor,
      input.contactEmail,
      input.contactPhone,
      JSON.stringify(input.social ?? {}),
      id
    ]
  );
}

export async function upsertFederation(input: Store['federation']) {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    store.federation = input;
    await writeStore(store);
    return;
  }

  await upsertStaticPage('federacion', 'Federacion', input.about);
  await upsertStaticPage('mision', 'Mision', input.mission);
  await upsertStaticPage('vision', 'Vision', input.vision);
}

export async function upsertPublicSite(input: Store['publicSite']) {
  assertDbReady();
  const store = await readStore();
  store.publicSite = input;
  await writeStore(store);
}

async function upsertStaticPage(slug: string, title: string, content: string) {
  await db.query(
    `INSERT INTO static_pages (slug, title, content)
     VALUES ($1, $2, $3)
     ON CONFLICT (slug)
     DO UPDATE SET content = EXCLUDED.content, title = EXCLUDED.title, updated_at = NOW()`,
    [slug, title, content]
  );
}

export async function upsertHero(input: Store['hero']) {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    store.hero = input;
    await writeStore(store);
    return;
  }

  const latest = await db.query('SELECT id FROM site_settings ORDER BY id DESC LIMIT 1');
  const id = latest.rows[0]?.id as number | undefined;

  if (!id) {
    await db.query(
      `INSERT INTO site_settings (hero_title, hero_subtitle, hero_image_url, hero_badge)
       VALUES ($1,$2,$3,$4)`,
      [input.title, input.subtitle, input.imageUrl, input.badge]
    );
    return;
  }

  await db.query(
    `UPDATE site_settings
     SET hero_title=$1, hero_subtitle=$2, hero_image_url=$3, hero_badge=$4, updated_at=NOW()
     WHERE id=$5`,
    [input.title, input.subtitle, input.imageUrl, input.badge, id]
  );
}

export async function upsertHome(input: Store['home']) {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    store.home = input;
    await writeStore(store);
    return;
  }

  const latest = await db.query('SELECT id FROM site_settings ORDER BY id DESC LIMIT 1');
  const id = latest.rows[0]?.id as number | undefined;

  const homeNews = JSON.stringify(input.news ?? []);
  const homeEventHighlight = JSON.stringify(input.eventHighlight ?? {});
  const homeStars = JSON.stringify(input.stars ?? []);
  const homeCta = JSON.stringify(input.cta ?? {});
  const homeSponsors = JSON.stringify((input as any).sponsors ?? []);

  try {
    if (!id) {
      await db.query(
        `INSERT INTO site_settings (home_news, home_event_highlight, home_stars, home_cta, home_sponsors)
         VALUES ($1,$2,$3,$4,$5)`,
        [homeNews, homeEventHighlight, homeStars, homeCta, homeSponsors]
      );
      return;
    }

    await db.query(
      `UPDATE site_settings
       SET home_news=$1, home_event_highlight=$2, home_stars=$3, home_cta=$4, home_sponsors=$5, updated_at=NOW()
       WHERE id=$6`,
      [homeNews, homeEventHighlight, homeStars, homeCta, homeSponsors, id]
    );
  } catch (error) {
    console.warn('[admin] upsertHome failed.', error);
    const store = await readStore();
    store.home = input;
    await writeStore(store);
  }
}

export async function upsertClubs(input: Store['clubs']) {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    store.clubs = input;
    await writeStore(store);
    return;
  }

  try {
    await db.transaction(async (client) => {
      const keptNames: string[] = [];
      for (const club of input) {
        const normalizedName = String(club.name ?? '').trim();
        if (!normalizedName) continue;
        keptNames.push(normalizedName);

        await client.query(
          `INSERT INTO clubs (name, municipality, status, coach, athletes_count, logo_url, category)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (name)
           DO UPDATE SET
             municipality = EXCLUDED.municipality,
             status = EXCLUDED.status,
             coach = EXCLUDED.coach,
             athletes_count = EXCLUDED.athletes_count,
             logo_url = EXCLUDED.logo_url,
             category = EXCLUDED.category,
             updated_at = NOW()`,
          [
            normalizedName,
            club.municipality ?? '',
            club.status ?? 'En revision',
            club.coach ?? '',
            Number(club.athletes) || 0,
            club.imageUrl ?? null,
            club.category ?? null
          ]
        );
      }

      if (keptNames.length === 0) {
        await client.query('DELETE FROM clubs');
      } else {
        await client.query('DELETE FROM clubs WHERE NOT (name = ANY($1::text[]))', [keptNames]);
      }
    });
  } catch (error) {
    console.warn('[admin] upsertClubs failed, falling back to local store.', error);
    const store = await readStore();
    store.clubs = input;
    await writeStore(store);
  }
}

export async function upsertConvocatorias(input: Store['convocatorias']) {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    store.convocatorias = input;
    await writeStore(store);
    return;
  }

  try {
    await syncOrderedTableById('convocatorias', input.length, async (rowId, client) => {
      const c = input[rowId - 1];
      await client.query(
        `INSERT INTO convocatorias
          (id, title, category, status, open_date, close_date, location, audience, description, requirements, categories, image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (id)
         DO UPDATE SET
           title = EXCLUDED.title,
           category = EXCLUDED.category,
           status = EXCLUDED.status,
           open_date = EXCLUDED.open_date,
           close_date = EXCLUDED.close_date,
           location = EXCLUDED.location,
           audience = EXCLUDED.audience,
           description = EXCLUDED.description,
           requirements = EXCLUDED.requirements,
           categories = EXCLUDED.categories,
           image_url = EXCLUDED.image_url,
           updated_at = NOW()`,
        [
          rowId,
          c.title,
          c.category ?? '',
          c.status ?? 'Proximamente',
          c.openDate ? c.openDate : null,
          c.closeDate ? c.closeDate : null,
          c.location ?? '',
          c.audience ?? '',
          c.description ?? '',
          JSON.stringify(c.requirements ?? []),
          JSON.stringify(c.categories ?? []),
          c.imageUrl ?? null
        ]
      );
    });
  } catch (error) {
    console.warn('[admin] upsertConvocatorias failed, falling back to local store.', error);
    const store = await readStore();
    store.convocatorias = input;
    await writeStore(store);
  }
}

export async function upsertCompetencias(input: Store['competencias']) {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    store.competencias = input;
    await writeStore(store);
    return;
  }

  try {
    await syncOrderedTableById('competencias', input.length, async (rowId, client) => {
      const c = input[rowId - 1];
      await client.query(
        `INSERT INTO competencias
          (id, title, status, event_date, location, type, description, downloads, image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id)
         DO UPDATE SET
           title = EXCLUDED.title,
           status = EXCLUDED.status,
           event_date = EXCLUDED.event_date,
           location = EXCLUDED.location,
           type = EXCLUDED.type,
           description = EXCLUDED.description,
           downloads = EXCLUDED.downloads,
           image_url = EXCLUDED.image_url,
           updated_at = NOW()`,
        [
          rowId,
          c.title,
          c.status ?? 'Confirmado',
          c.date ? c.date : null,
          c.location ?? '',
          c.type ?? null,
          c.description ?? '',
          JSON.stringify(c.downloads ?? []),
          c.imageUrl ?? null
        ]
      );
    });

  } catch (error) {
    console.warn('[admin] upsertCompetencias failed, falling back to local store.', error);
    const store = await readStore();
    store.competencias = input;
    await writeStore(store);
  }
}

export async function upsertResults(input: Store['results']) {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    store.results = input;
    await writeStore(store);
    return;
  }

  try {
    await syncOrderedTableById('results', input.length, async (rowId, client) => {
      const r = input[rowId - 1];
      await client.query(
        `INSERT INTO results
          (id, pos, athlete, category, club, mark, event, event_date, image_url, download_url, is_gold)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id)
         DO UPDATE SET
           pos = EXCLUDED.pos,
           athlete = EXCLUDED.athlete,
           category = EXCLUDED.category,
           club = EXCLUDED.club,
           mark = EXCLUDED.mark,
           event = EXCLUDED.event,
           event_date = EXCLUDED.event_date,
           image_url = EXCLUDED.image_url,
           download_url = EXCLUDED.download_url,
           is_gold = EXCLUDED.is_gold,
           updated_at = NOW()`,
        [
          rowId,
          r.pos ?? '',
          r.athlete ?? '',
          r.category ?? '',
          r.club ?? '',
          r.mark ?? '',
          r.event ?? '',
          r.date ? r.date : null,
          r.imageUrl ?? null,
          r.downloadUrl ?? null,
          Boolean(r.isGold)
        ]
      );
    });

    for (let index = 0; index < input.length; index += 1) {
      const r = input[index];
      await onResultInserted({
        id: index + 1,
        athlete: r.athlete ?? '',
        category: r.category ?? '',
        club: r.club ?? '',
        mark: r.mark ?? '',
        event: r.event ?? '',
        eventDate: r.date || null
      });
    }
  } catch (error) {
    console.warn('[admin] upsertResults failed, falling back to local store.', error);
    const store = await readStore();
    store.results = input;
    await writeStore(store);
  }
}

export async function upsertRankings(input: Store['rankings']) {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    store.rankings = input;
    await writeStore(store);
    return;
  }

  try {
    await syncOrderedTableById('rankings', input.length, async (rowId, client) => {
      const r = input[rowId - 1];
      const key = [r.category ?? '', r.discipline ?? '', r.gender ?? '', r.season ?? '']
        .map((part) => String(part).trim().toLowerCase())
        .join('|');
      await client.query(
        `INSERT INTO rankings
          (id, ranking_key, rank, athlete, club, mark, status, category, discipline, gender, season, image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (id)
         DO UPDATE SET
           ranking_key = EXCLUDED.ranking_key,
           rank = EXCLUDED.rank,
           athlete = EXCLUDED.athlete,
           club = EXCLUDED.club,
           mark = EXCLUDED.mark,
           status = EXCLUDED.status,
           category = EXCLUDED.category,
           discipline = EXCLUDED.discipline,
           gender = EXCLUDED.gender,
           season = EXCLUDED.season,
           image_url = EXCLUDED.image_url,
           updated_at = NOW()`,
        [
          rowId,
          key,
          r.rank ?? '',
          r.athlete ?? '',
          r.club ?? '',
          r.mark ?? '',
          r.status ?? 'Verificado',
          r.category ?? '',
          r.discipline ?? '',
          r.gender ?? '',
          r.season ?? '',
          r.imageUrl ?? null
        ]
      );
    });
  } catch (error) {
    console.warn('[admin] upsertRankings failed, falling back to local store.', error);
    const store = await readStore();
    store.rankings = input;
    await writeStore(store);
  }
}

export type EventRow = {
  id: number;
  name: string;
  date: string;
  location: string;
  category: string;
  status: string;
  resultsUrl: string | null;
};

export async function upsertNews(input: Store['news']) {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    store.news = input;
    await writeStore(store);
    return;
  }

  try {
    await db.transaction(async (client) => {
      const keptSlugs: string[] = [];
      for (const n of input) {
        const slug = String(n.slug ?? '').trim();
        if (!slug) continue;
        keptSlugs.push(slug);

        await client.query(
          `INSERT INTO news (slug, title, excerpt, category, published_date, image_url, body)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (slug)
           DO UPDATE SET
             title = EXCLUDED.title,
             excerpt = EXCLUDED.excerpt,
             category = EXCLUDED.category,
             published_date = EXCLUDED.published_date,
             image_url = EXCLUDED.image_url,
             body = EXCLUDED.body,
             updated_at = NOW()`,
          [
            slug,
            n.title,
            n.excerpt ?? '',
            n.category ?? '',
            n.date ? n.date : null,
            n.imageUrl ?? null,
            JSON.stringify(Array.isArray(n.body) ? n.body : [])
          ]
        );
      }

      if (keptSlugs.length === 0) {
        await client.query('DELETE FROM news');
      } else {
        await client.query('DELETE FROM news WHERE NOT (slug = ANY($1::text[]))', [keptSlugs]);
      }
    });
  } catch (error) {
    console.warn('[admin] upsertNews failed, falling back to local store.', error);
    const store = await readStore();
    store.news = input;
    await writeStore(store);
  }
}

export async function upsertBlogPosts(input: Store['blogPosts']) {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    store.blogPosts = input;
    await writeStore(store);
    return;
  }

  try {
    await db.transaction(async (client) => {
      const keptSlugs: string[] = [];
      for (const p of input) {
        const slug = String(p.slug ?? '').trim();
        if (!slug) continue;
        keptSlugs.push(slug);

        await client.query(
          `INSERT INTO blog_posts (slug, type, title, excerpt, published_date, tags, image_url, body)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (slug)
           DO UPDATE SET
             type = EXCLUDED.type,
             title = EXCLUDED.title,
             excerpt = EXCLUDED.excerpt,
             published_date = EXCLUDED.published_date,
             tags = EXCLUDED.tags,
             image_url = EXCLUDED.image_url,
             body = EXCLUDED.body,
             updated_at = NOW()`,
          [
            slug,
            p.type ?? 'Tecnico',
            p.title,
            p.excerpt ?? '',
            p.date ? p.date : null,
            JSON.stringify(Array.isArray(p.tags) ? p.tags : []),
            p.imageUrl ?? null,
            JSON.stringify(Array.isArray(p.body) ? p.body : [])
          ]
        );
      }

      if (keptSlugs.length === 0) {
        await client.query('DELETE FROM blog_posts');
      } else {
        await client.query('DELETE FROM blog_posts WHERE NOT (slug = ANY($1::text[]))', [keptSlugs]);
      }
    });
  } catch (error) {
    console.warn('[admin] upsertBlogPosts failed, falling back to local store.', error);
    const store = await readStore();
    store.blogPosts = input;
    await writeStore(store);
  }
}

export async function listEvents(): Promise<EventRow[]> {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    return store.events.map((e, i) => ({
      id: i + 1,
      name: e.name,
      date: e.date,
      location: e.location,
      category: e.category ?? '',
      status: e.status,
      resultsUrl: e.resultsUrl ?? null
    }));
  }
  try {
    const res = await db.query(
      'SELECT id, name, start_date::text as date, location, COALESCE(category, \'\') as category, status, results_url as "resultsUrl" FROM events ORDER BY start_date ASC'
    );
    return res.rows;
  } catch (error) {
    console.warn('[admin] listEvents: category column missing, falling back.', error);
    const res = await db.query(
      'SELECT id, name, start_date::text as date, location, status, results_url as "resultsUrl" FROM events ORDER BY start_date ASC'
    );
    return res.rows.map((r: any) => ({ ...r, category: '' }));
  }
}

export async function createEvent(input: Omit<EventRow, 'id'>) {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    store.events.push({
      name: input.name,
      date: input.date,
      location: input.location,
      category: input.category ?? '',
      status: input.status,
      resultsUrl: input.resultsUrl ?? ''
    });
    await writeStore(store);
    return;
  }
  try {
    await db.query(
      'INSERT INTO events (name, start_date, location, category, status, results_url) VALUES ($1,$2,$3,$4,$5,$6)',
      [input.name, input.date, input.location, input.category ?? '', input.status, input.resultsUrl]
    );
  } catch (error) {
    console.warn('[admin] createEvent: category column missing, falling back.', error);
    await db.query(
      'INSERT INTO events (name, start_date, location, status, results_url) VALUES ($1,$2,$3,$4,$5)',
      [input.name, input.date, input.location, input.status, input.resultsUrl]
    );
  }
}

export async function updateEvent(id: number, input: Omit<EventRow, 'id'>) {
  assertDbReady();
  if (!hasDatabase) return;
  try {
    await db.query(
      'UPDATE events SET name=$1, start_date=$2, location=$3, category=$4, status=$5, results_url=$6, updated_at=NOW() WHERE id=$7',
      [input.name, input.date, input.location, input.category ?? '', input.status, input.resultsUrl, id]
    );
  } catch (error) {
    console.warn('[admin] updateEvent: category column missing, falling back.', error);
    await db.query(
      'UPDATE events SET name=$1, start_date=$2, location=$3, status=$4, results_url=$5, updated_at=NOW() WHERE id=$6',
      [input.name, input.date, input.location, input.status, input.resultsUrl, id]
    );
  }
}

export async function deleteEvent(id: number) {
  assertDbReady();
  if (!hasDatabase) return;
  await db.query('DELETE FROM events WHERE id=$1', [id]);
}

export async function updateEventResultsLink(id: number, resultsUrl: string | null) {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    const index = Math.max(0, id - 1);
    const current = store.events[index];
    if (!current) return;
    store.events[index] = {
      ...current,
      resultsUrl: resultsUrl ?? ''
    };
    await writeStore(store);
    return;
  }

  await db.query('UPDATE events SET results_url=$1, updated_at=NOW() WHERE id=$2', [resultsUrl, id]);
}

export async function updateCompetenciaResultsLink(index: number, resultsUrl: string | null) {
  assertDbReady();
  const safeIndex = Math.max(0, Math.trunc(index));
  const normalized = String(resultsUrl ?? '').trim();

  const applyUrl = (downloads: Array<{ label: string; href: string }> | undefined) => {
    const current = Array.isArray(downloads) ? [...downloads] : [];
    const resultLinkIndex = current.findIndex((item) => String(item?.label ?? '').trim().toLowerCase() === 'resultados');

    if (!normalized) {
      if (resultLinkIndex >= 0) current.splice(resultLinkIndex, 1);
      return current;
    }

    if (resultLinkIndex >= 0) {
      current[resultLinkIndex] = { ...current[resultLinkIndex], href: normalized };
    } else {
      current.unshift({ label: 'Resultados', href: normalized });
    }
    return current;
  };

  if (!hasDatabase) {
    const store = await readStore();
    if (!store.competencias[safeIndex]) return;
    store.competencias[safeIndex] = {
      ...store.competencias[safeIndex],
      downloads: applyUrl(store.competencias[safeIndex].downloads)
    };
    await writeStore(store);
    return;
  }

  const data = await getAdminData();
  if (!data.competencias[safeIndex]) return;
  data.competencias[safeIndex] = {
    ...data.competencias[safeIndex],
    downloads: applyUrl(data.competencias[safeIndex].downloads)
  };
  await upsertCompetencias(data.competencias);
}

export type DocumentRow = { id: number; title: string; description: string; href: string; category: string; date: string };

export async function listDocuments(): Promise<DocumentRow[]> {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    return store.documents.map((d, i) => ({
      id: i + 1,
      title: d.title,
      description: d.description,
      href: d.href,
      category: d.category ?? '',
      date: d.date ?? ''
    }));
  }
  try {
    const res = await db.query(
      'SELECT id, title, COALESCE(description, \'\') as description, file_url as href, COALESCE(category, \'\') as category, COALESCE(published_date::text, \'\') as date FROM documents ORDER BY COALESCE(published_date, created_at) DESC, id DESC'
    );
    return res.rows;
  } catch (error) {
    console.warn('[admin] listDocuments: category/date columns missing, falling back.', error);
    const res = await db.query(
      'SELECT id, title, COALESCE(description, \'\') as description, file_url as href FROM documents ORDER BY created_at DESC'
    );
    return res.rows.map((r: any) => ({ ...r, category: '', date: '' }));
  }
}

export async function createDocument(input: Omit<DocumentRow, 'id'>) {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    store.documents.push({
      title: input.title,
      description: input.description,
      href: input.href,
      category: input.category ?? '',
      date: input.date ?? ''
    });
    await writeStore(store);
    return;
  }
  try {
    await db.query('INSERT INTO documents (title, description, category, published_date, file_url) VALUES ($1,$2,$3,$4,$5)', [
      input.title,
      input.description,
      input.category ?? '',
      input.date ? input.date : null,
      input.href
    ]);
  } catch (error) {
    console.warn('[admin] createDocument: category/date columns missing, falling back.', error);
    await db.query('INSERT INTO documents (title, description, file_url) VALUES ($1,$2,$3)', [
      input.title,
      input.description,
      input.href
    ]);
  }
}

export async function updateDocument(id: number, input: Omit<DocumentRow, 'id'>) {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    const index = Math.max(0, id - 1);
    if (!store.documents[index]) return;
    store.documents[index] = {
      title: input.title,
      description: input.description,
      href: input.href,
      category: input.category ?? '',
      date: input.date ?? ''
    };
    await writeStore(store);
    return;
  }
  try {
    await db.query(
      'UPDATE documents SET title=$1, description=$2, category=$3, published_date=$4, file_url=$5, updated_at=NOW() WHERE id=$6',
      [input.title, input.description, input.category ?? '', input.date ? input.date : null, input.href, id]
    );
  } catch (error) {
    console.warn('[admin] updateDocument: category/date columns missing, falling back.', error);
    await db.query('UPDATE documents SET title=$1, description=$2, file_url=$3, updated_at=NOW() WHERE id=$4', [
      input.title,
      input.description,
      input.href,
      id
    ]);
  }
}

export async function deleteDocument(id: number) {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    const index = Math.max(0, id - 1);
    store.documents.splice(index, 1);
    await writeStore(store);
    return;
  }
  await db.query('DELETE FROM documents WHERE id=$1', [id]);
}

export type MarkRow = {
  id: number;
  athlete: string;
  discipline: string;
  value: string;
  unit: string;
  recordDate: string;
};

export async function listMarks(): Promise<MarkRow[]> {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    return store.records.map((r, i) => ({
      id: i + 1,
      athlete: r.athlete,
      discipline: r.category,
      value: r.mark,
      unit: '',
      recordDate: r.date
    }));
  }
  const res = await db.query(
    `SELECT m.id,
            a.first_name || ' ' || a.last_name AS athlete,
            m.discipline,
            m.value::text as value,
            m.unit,
            m.record_date::text as "recordDate"
     FROM marks m
     JOIN athletes a ON a.id = m.athlete_id
     ORDER BY m.record_date DESC`
  );
  return res.rows;
}

export async function createMark(input: {
  athleteName: string;
  discipline: string;
  value: number;
  unit: string;
  recordDate: string;
}) {
  assertDbReady();
  if (!hasDatabase) return;
  const athleteId = await getOrCreateAthlete(input.athleteName);
  await db.query('INSERT INTO marks (athlete_id, discipline, value, unit, record_date) VALUES ($1,$2,$3,$4,$5)', [
    athleteId,
    input.discipline,
    input.value,
    input.unit,
    input.recordDate
  ]);
}

export async function deleteMark(id: number) {
  assertDbReady();
  if (!hasDatabase) return;
  await db.query('DELETE FROM marks WHERE id=$1', [id]);
}

async function getOrCreateAthlete(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts.shift() ?? fullName.trim();
  const lastName = parts.join(' ');

  const found = await db.query('SELECT id FROM athletes WHERE first_name=$1 AND last_name=$2 LIMIT 1', [
    firstName,
    lastName
  ]);
  const existingId = found.rows[0]?.id as number | undefined;
  if (existingId) return existingId;

  const created = await db.query('INSERT INTO athletes (first_name, last_name) VALUES ($1,$2) RETURNING id', [
    firstName,
    lastName
  ]);
  return created.rows[0].id as number;
}

