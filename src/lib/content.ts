import { db } from './db';
import { isDbUnavailableError } from './db';
import { getDatabaseUrl, requireDatabase } from './env';
import { readStore, writeStore, type Store } from './store';
import { computeConvocatoriaStatus } from './convocatorias-status';

const hasDatabase = Boolean(getDatabaseUrl());
let warnedDbOffline = false;
let cachedHasConvocatoriasStatusMode: boolean | null = null;

function isMissingColumnError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  return (error as { code?: string }).code === '42703';
}

async function hasColumn(tableName: string, columnName: string) {
  const res = await db.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = $1
       AND column_name = $2
     LIMIT 1`,
    [tableName, columnName]
  );
  return res.rowCount > 0;
}

async function hasConvocatoriasStatusModeColumn() {
  if (cachedHasConvocatoriasStatusMode !== null) return cachedHasConvocatoriasStatusMode;
  cachedHasConvocatoriasStatusMode = await hasColumn('convocatorias', 'status_mode');
  return cachedHasConvocatoriasStatusMode;
}

export async function getHomeData() {
  if (requireDatabase() && !hasDatabase) {
    throw new Error(
      'REQUIRE_DB is enabled but DATABASE_URL is missing/invalid. Configure a real Postgres DATABASE_URL or disable REQUIRE_DB.'
    );
  }
  if (!hasDatabase) {
    const store = await readStore();
    const updatedConvocatorias = (store.convocatorias ?? []).map((item) => ({
      ...item,
      statusMode: 'auto' as const,
      status: computeConvocatoriaStatus({
        openDate: item.openDate,
        closeDate: item.closeDate
      })
    }));
    const changed = updatedConvocatorias.some(
      (item, index) =>
        item.status !== store.convocatorias[index]?.status || item.statusMode !== store.convocatorias[index]?.statusMode
    );
    if (changed) {
      store.convocatorias = updatedConvocatorias;
      await writeStore(store);
    }
    return store;
  }

  try {
    if (cachedHasConvocatoriasStatusMode === null) {
      try {
        await hasConvocatoriasStatusModeColumn();
      } catch {
        cachedHasConvocatoriasStatusMode = null;
      }
    }

    try {
      await db.query(
      `UPDATE convocatorias
       SET status = CASE
         WHEN close_date IS NOT NULL AND CURRENT_DATE > close_date THEN 'Cerrada'
         WHEN open_date IS NOT NULL AND CURRENT_DATE >= open_date AND (close_date IS NULL OR CURRENT_DATE <= close_date) THEN 'Abierta'
         ELSE 'Próximamente'
       END,
       status_mode = 'auto',
       updated_at = NOW()
       WHERE status IS DISTINCT FROM CASE
         WHEN close_date IS NOT NULL AND CURRENT_DATE > close_date THEN 'Cerrada'
         WHEN open_date IS NOT NULL AND CURRENT_DATE >= open_date AND (close_date IS NULL OR CURRENT_DATE <= close_date) THEN 'Abierta'
         ELSE 'Próximamente'
       END
          OR status_mode IS DISTINCT FROM 'auto'`
      );
    } catch (error) {
      if (isMissingColumnError(error)) {
        cachedHasConvocatoriasStatusMode = false;
      } else {
        console.warn('[content] Convocatorias auto-update (status_mode) fallback.', error);
      }
      await db.query(
        `UPDATE convocatorias
         SET status = CASE
           WHEN close_date IS NOT NULL AND CURRENT_DATE > close_date THEN 'Cerrada'
           WHEN open_date IS NOT NULL AND CURRENT_DATE >= open_date AND (close_date IS NULL OR CURRENT_DATE <= close_date) THEN 'Abierta'
           ELSE 'Próximamente'
         END,
         updated_at = NOW()
         WHERE status IS DISTINCT FROM CASE
           WHEN close_date IS NOT NULL AND CURRENT_DATE > close_date THEN 'Cerrada'
           WHEN open_date IS NOT NULL AND CURRENT_DATE >= open_date AND (close_date IS NULL OR CURRENT_DATE <= close_date) THEN 'Abierta'
           ELSE 'Próximamente'
         END`
      );
    }

    const settingsRes = await db.query('SELECT * FROM site_settings ORDER BY id DESC LIMIT 1');
    const settingsRow = settingsRes.rows[0];
    const storeFallback = await readStore();

    const hero = {
      title: settingsRow?.hero_title ?? 'Liga de Atletismo',
      subtitle: settingsRow?.hero_subtitle ?? 'Gestion deportiva moderna.',
      imageUrl: settingsRow?.hero_image_url ?? '',
      badge: settingsRow?.hero_badge ?? storeFallback.hero.badge
    };

    const homeNews = (settingsRow?.home_news ?? []) as Store['home']['news'];
    const homeEventHighlight = (settingsRow?.home_event_highlight ?? {}) as Store['home']['eventHighlight'];
    const homeStars = (settingsRow?.home_stars ?? []) as Store['home']['stars'];
    const homeCta = (settingsRow?.home_cta ?? {}) as Store['home']['cta'];
    const homeSponsors = (settingsRow?.home_sponsors ?? []) as Store['home']['sponsors'];

    const federationRes = await db.query('SELECT slug, content FROM static_pages');
    const federation = {
      about: federationRes.rows.find((row: { slug: string }) => row.slug === 'federacion')?.content ?? '',
      mission: federationRes.rows.find((row: { slug: string }) => row.slug === 'mision')?.content ?? '',
      vision: federationRes.rows.find((row: { slug: string }) => row.slug === 'vision')?.content ?? ''
    };

    let eventsRes;
    try {
      eventsRes = await db.query(
        'SELECT id, name, start_date as date, location, COALESCE(category, \'\') as category, status, results_url as "resultsUrl" FROM events ORDER BY start_date ASC'
      );
    } catch (error) {
      console.warn('[content] Events: category column missing, falling back.', error);
      eventsRes = await db.query(
        'SELECT id, name, start_date as date, location, status, results_url as "resultsUrl" FROM events ORDER BY start_date ASC'
      );
      eventsRes.rows = eventsRes.rows.map((r: any) => ({ ...r, category: '' }));
    }

    const recordsRes = await db.query(
      `SELECT a.first_name || ' ' || a.last_name AS athlete,
              m.value || m.unit AS mark,
              m.discipline AS category,
              m.record_date AS date
       FROM marks m
       JOIN athletes a ON a.id = m.athlete_id
       ORDER BY m.record_date DESC
       LIMIT 12`
    );

    // Resultados: tabla opcional (si el esquema aún no se ha actualizado, caemos a store)
    let results: Store['results'] = storeFallback.results;
    try {
      const resultsRes = await db.query(
        `SELECT pos,
                athlete,
                category,
                club,
                mark,
                event,
                COALESCE(event_date::text, '') as date,
                COALESCE(image_url, '') as "imageUrl",
                COALESCE(download_url, '') as "downloadUrl",
                COALESCE(is_gold, false) as "isGold"
         FROM results
         ORDER BY COALESCE(event_date, created_at) DESC, id DESC
         LIMIT 200`
      );
      results = resultsRes.rows.map((r: any) => ({
        pos: String(r.pos ?? '').padStart(2, '0'),
        athlete: r.athlete ?? '',
        category: r.category ?? '',
        club: r.club ?? '',
        mark: r.mark ?? '',
        event: r.event ?? '',
        date: r.date ?? '',
        imageUrl: r.imageUrl || undefined,
        downloadUrl: r.downloadUrl || undefined,
        isGold: Boolean(r.isGold)
      }));
    } catch (error) {
      console.warn('[content] Results table unavailable, falling back to local store.', error);
    }

    // Rankings: tabla opcional (si el esquema aún no se ha actualizado, caemos a store)
    let rankings: Store['rankings'] = storeFallback.rankings;
    try {
      const rankingsRes = await db.query(
        `SELECT rank,
                athlete,
                club,
                mark,
                status,
                category,
                discipline,
                gender,
                season,
                COALESCE(image_url, '') as "imageUrl"
         FROM rankings
         ORDER BY COALESCE(NULLIF(rank, ''), '999')::int ASC, id ASC
         LIMIT 400`
      );
      rankings = rankingsRes.rows.map((r: any) => ({
        rank: String(r.rank ?? '').padStart(2, '0'),
        athlete: r.athlete ?? '',
        club: r.club ?? '',
        mark: r.mark ?? '',
        status: r.status ?? 'Verificado',
        category: r.category ?? '',
        discipline: r.discipline ?? '',
        gender: r.gender ?? '',
        season: r.season ?? '',
        imageUrl: r.imageUrl || undefined
      }));
    } catch (error) {
      console.warn('[content] Rankings table unavailable, falling back to local store.', error);
    }

    // Noticias: tabla opcional (si el esquema aún no se ha actualizado, caemos a store)
    let news: Store['news'] = storeFallback.news;
    try {
      const newsRes = await db.query(
        `SELECT slug,
                title,
                COALESCE(excerpt, '') as excerpt,
                COALESCE(category, '') as category,
                COALESCE(published_date::text, '') as date,
                COALESCE(image_url, '') as "imageUrl",
                COALESCE(body, '[]'::jsonb) as body
         FROM news
         ORDER BY COALESCE(published_date, created_at) DESC, id DESC
         LIMIT 300`
      );
      news = newsRes.rows.map((n: any) => ({
        slug: n.slug ?? '',
        title: n.title ?? '',
        excerpt: n.excerpt ?? '',
        category: n.category ?? '',
        date: n.date ?? '',
        imageUrl: n.imageUrl || undefined,
        body: Array.isArray(n.body) ? n.body.map((x: any) => String(x)) : []
      }));
    } catch (error) {
      console.warn('[content] News table unavailable, falling back to local store.', error);
    }

    // Blog: tabla opcional (si el esquema aún no se ha actualizado, caemos a store)
    let blogPosts: Store['blogPosts'] = storeFallback.blogPosts;
    try {
      let blogRes;
      try {
        blogRes = await db.query(
        `SELECT slug,
                COALESCE(type, 'Técnico') as type,
                title,
                COALESCE(excerpt, '') as excerpt,
                COALESCE(published_date::text, '') as date,
                COALESCE(tags, '[]'::jsonb) as tags,
                COALESCE(image_url, '') as "imageUrl",
                COALESCE(video_url, '') as "videoUrl",
                COALESCE(body, '[]'::jsonb) as body
         FROM blog_posts
         ORDER BY COALESCE(published_date, created_at) DESC, id DESC
         LIMIT 500`
        );
      } catch (error) {
        blogRes = await db.query(
          `SELECT slug,
                  COALESCE(type, 'Técnico') as type,
                  title,
                  COALESCE(excerpt, '') as excerpt,
                  COALESCE(published_date::text, '') as date,
                  COALESCE(tags, '[]'::jsonb) as tags,
                  COALESCE(image_url, '') as "imageUrl",
                  COALESCE(body, '[]'::jsonb) as body
           FROM blog_posts
           ORDER BY COALESCE(published_date, created_at) DESC, id DESC
           LIMIT 500`
        );
        blogRes.rows = blogRes.rows.map((row: any) => ({ ...row, videoUrl: '' }));
      }
      blogPosts = blogRes.rows.map((p: any) => ({
        slug: p.slug ?? '',
        type: p.type ?? 'Técnico',
        title: p.title ?? '',
        excerpt: p.excerpt ?? '',
        date: p.date ?? '',
        tags: Array.isArray(p.tags) ? p.tags.map((x: any) => String(x)) : [],
        imageUrl: p.imageUrl || undefined,
        videoUrl: p.videoUrl || undefined,
        body: Array.isArray(p.body) ? p.body.map((x: any) => String(x)) : []
      }));
    } catch (error) {
      console.warn('[content] Blog table unavailable, falling back to local store.', error);
    }

    const documentsRes = await db.query(
      'SELECT title, COALESCE(description, \'\') as description, file_url as href FROM documents ORDER BY created_at DESC'
    );

    // Convocatorias: tabla opcional (si el esquema aún no se ha actualizado, caemos a store)
    let convocatorias: Store['convocatorias'] = storeFallback.convocatorias;
    try {
      let convocatoriasRes;
      try {
        convocatoriasRes = await db.query(
          `SELECT title,
                  category,
                  status,
                  COALESCE(status_mode, 'auto') as "statusMode",
                  COALESCE(max_events_per_athlete, 1)::int as "maxEventsPerAthlete",
                  COALESCE(open_date::text, '') as "openDate",
                  COALESCE(close_date::text, '') as "closeDate",
                  location,
                  audience,
                  description,
                  requirements,
                  categories,
                  COALESCE(disciplines, '[]'::jsonb) as disciplines,
                  COALESCE(events, '[]'::jsonb) as events,
                  COALESCE(image_url, '') as "imageUrl"
           FROM convocatorias
           ORDER BY COALESCE(open_date, created_at) DESC`
        );
      } catch (error) {
        if (isMissingColumnError(error)) {
          cachedHasConvocatoriasStatusMode = false;
        } else {
          console.warn('[content] Convocatorias select (status_mode) fallback.', error);
        }
        convocatoriasRes = await db.query(
          `SELECT title,
                  category,
                  status,
                  1::int as "maxEventsPerAthlete",
                  COALESCE(open_date::text, '') as "openDate",
                  COALESCE(close_date::text, '') as "closeDate",
                  location,
                  audience,
                  description,
                  requirements,
                  categories,
                  '[]'::jsonb as disciplines,
                  '[]'::jsonb as events,
                  COALESCE(image_url, '') as "imageUrl"
           FROM convocatorias
           ORDER BY COALESCE(open_date, created_at) DESC`
        );
      }
      convocatorias = convocatoriasRes.rows.map((r: any) => {
        return {
          title: r.title,
          category: r.category ?? '',
          openDate: r.openDate ?? '',
          status: computeConvocatoriaStatus({ openDate: r.openDate, closeDate: r.closeDate }),
          statusMode: 'auto',
          maxEventsPerAthlete: Math.max(1, Number(r.maxEventsPerAthlete ?? 1) || 1),
          closeDate: r.closeDate ?? '',
          location: r.location ?? '',
          audience: r.audience ?? '',
          description: r.description ?? '',
          requirements: Array.isArray(r.requirements) ? r.requirements : [],
          categories: Array.isArray(r.categories) ? r.categories : [],
          disciplines: Array.isArray(r.disciplines) ? r.disciplines : [],
          events: Array.isArray(r.events) ? r.events : [],
          imageUrl: r.imageUrl || undefined
        };
      });
    } catch (error) {
      console.warn('[content] Convocatorias table unavailable, falling back to local store.', error);
    }

    // Competencias: tabla opcional (si el esquema aún no se ha actualizado, caemos a store)
    let competencias: Store['competencias'] = storeFallback.competencias;
    try {
      const competenciasRes = await db.query(
        `SELECT title,
                status,
                COALESCE(event_date::text, '') as date,
                location,
                COALESCE(type, '') as type,
                description,
                downloads,
                COALESCE(image_url, '') as "imageUrl"
         FROM competencias
         ORDER BY COALESCE(event_date, created_at) DESC`
      );
      competencias = competenciasRes.rows.map((r: any) => ({
        title: r.title,
        status: r.status ?? 'Confirmado',
        date: r.date ?? '',
        location: r.location ?? '',
        type: r.type || undefined,
        description: r.description ?? '',
        downloads: Array.isArray(r.downloads) ? r.downloads : [],
        imageUrl: r.imageUrl || undefined
      }));
    } catch (error) {
      console.warn('[content] Competencias table unavailable, falling back to local store.', error);
    }

    // Clubs: tabla opcional (si el esquema aún no se ha actualizado, caemos a store)
    let clubs: Store['clubs'] = storeFallback.clubs;
    try {
      const clubsRes = await db.query(
        `SELECT id,
                name,
                municipality,
                status,
                coach,
                athletes_count as athletes,
                COALESCE(logo_url, '') as "imageUrl",
                COALESCE(category, '') as category
         FROM clubs
         ORDER BY name ASC`
      );
      clubs = clubsRes.rows.map((r: any) => ({
        id: Number(r.id),
        name: r.name,
        municipality: r.municipality,
        status: r.status,
        coach: r.coach,
        athletes: Number(r.athletes) || 0,
        imageUrl: r.imageUrl || undefined,
        category: r.category || undefined
      }));
    } catch (error) {
      console.warn('[content] Clubs table unavailable, falling back to local store.', error);
    }

    return {
      settings: {
        siteName: settingsRow?.site_name ?? 'Liga de Atletismo',
        logoUrl: settingsRow?.logo_url ?? '',
        primaryColor: settingsRow?.primary_color ?? '#1E6BFF',
        secondaryColor: settingsRow?.secondary_color ?? '#FF6A00',
        contactEmail: settingsRow?.contact_email ?? '',
        contactPhone: settingsRow?.contact_phone ?? '',
        social: settingsRow?.social_links ?? {}
      },
      hero,
      home: {
        news: Array.isArray(homeNews) && homeNews.length ? homeNews : storeFallback.home.news,
        eventHighlight:
          homeEventHighlight && typeof homeEventHighlight === 'object' && Object.keys(homeEventHighlight).length
            ? homeEventHighlight
            : storeFallback.home.eventHighlight,
        stars: Array.isArray(homeStars) && homeStars.length ? homeStars : storeFallback.home.stars,
        cta:
          homeCta && typeof homeCta === 'object' && Object.keys(homeCta).length ? homeCta : storeFallback.home.cta,
        sponsors: Array.isArray(homeSponsors) ? homeSponsors : storeFallback.home.sponsors
      },
      federation,
      publicSite: storeFallback.publicSite,
      newsPage: storeFallback.newsPage,
      news,
      blogPage: storeFallback.blogPage,
      blogPosts,
      events: eventsRes.rows,
      records: recordsRes.rows,
      rankings,
      results,
      documents: documentsRes.rows,
      convocatorias,
      competencias,
      clubs
    } as Store;
  } catch (error) {
    if (requireDatabase()) throw error;
    if (isDbUnavailableError(error)) {
      if (!warnedDbOffline) {
        warnedDbOffline = true;
        console.warn('[content] Database unavailable (ECONNREFUSED). Running with local store fallback.');
      }
    } else {
      console.warn('[content] Database unavailable, falling back to local store.');
    }
    return readStore();
  }
}

export async function saveSettings(input: Store['settings']) {
  if (requireDatabase() && !hasDatabase) {
    throw new Error('REQUIRE_DB is enabled but DATABASE_URL is missing/invalid.');
  }
  if (!hasDatabase) {
    const store = await readStore();
    store.settings = input;
    await writeStore(store);
    return;
  }

  try {
    await db.query(
      `INSERT INTO site_settings
        (site_name, logo_url, primary_color, secondary_color, contact_email, contact_phone, social_links)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
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
  } catch (error) {
    if (requireDatabase()) throw error;
    console.warn('[content] saveSettings failed, falling back to local store.', error);
    const store = await readStore();
    store.settings = input;
    await writeStore(store);
  }
}

export async function saveFederation(input: Store['federation']) {
  if (requireDatabase() && !hasDatabase) {
    throw new Error('REQUIRE_DB is enabled but DATABASE_URL is missing/invalid.');
  }
  if (!hasDatabase) {
    const store = await readStore();
    store.federation = input;
    await writeStore(store);
    return;
  }

  try {
    await upsertStaticPage('federacion', 'Federacion', input.about);
    await upsertStaticPage('mision', 'Mision', input.mission);
    await upsertStaticPage('vision', 'Vision', input.vision);
  } catch (error) {
    if (requireDatabase()) throw error;
    console.warn('[content] saveFederation failed, falling back to local store.', error);
    const store = await readStore();
    store.federation = input;
    await writeStore(store);
  }
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

export async function saveHero(input: Store['hero']) {
  if (requireDatabase() && !hasDatabase) {
    throw new Error('REQUIRE_DB is enabled but DATABASE_URL is missing/invalid.');
  }
  if (!hasDatabase) {
    const store = await readStore();
    store.hero = input;
    await writeStore(store);
    return;
  }

  try {
    await db.query(
      `INSERT INTO site_settings (hero_title, hero_subtitle, hero_image_url, hero_badge)
       VALUES ($1, $2, $3, $4)`,
      [input.title, input.subtitle, input.imageUrl, input.badge]
    );
  } catch (error) {
    if (requireDatabase()) throw error;
    console.warn('[content] saveHero failed, falling back to local store.', error);
    const store = await readStore();
    store.hero = input;
    await writeStore(store);
  }
}

export async function saveEvents(events: Store['events']) {
  if (requireDatabase() && !hasDatabase) {
    throw new Error('REQUIRE_DB is enabled but DATABASE_URL is missing/invalid.');
  }
  if (!hasDatabase) {
    const store = await readStore();
    store.events = events;
    await writeStore(store);
    return;
  }

  try {
    await db.query('DELETE FROM events');
    for (const event of events) {
      await db.query(
        'INSERT INTO events (name, start_date, location, status, results_url) VALUES ($1, $2, $3, $4, $5)',
        [event.name, event.date, event.location, event.status, event.resultsUrl ?? null]
      );
    }
  } catch (error) {
    if (requireDatabase()) throw error;
    console.warn('[content] saveEvents failed, falling back to local store.', error);
    const store = await readStore();
    store.events = events;
    await writeStore(store);
  }
}

export async function saveRecords(records: Store['records']) {
  if (requireDatabase() && !hasDatabase) {
    throw new Error('REQUIRE_DB is enabled but DATABASE_URL is missing/invalid.');
  }
  if (!hasDatabase) {
    const store = await readStore();
    store.records = records;
    await writeStore(store);
    return;
  }

  try {
    await db.query('DELETE FROM marks');
    await db.query('DELETE FROM athletes');

    for (const record of records) {
      const nameParts = record.athlete.split(' ');
      const firstName = nameParts.shift() ?? record.athlete;
      const lastName = nameParts.join(' ') || '';

      const athleteRes = await db.query(
        'INSERT INTO athletes (first_name, last_name) VALUES ($1, $2) RETURNING id',
        [firstName, lastName]
      );
      const athleteId = athleteRes.rows[0]?.id;
      if (!athleteId) continue;

      const [valuePart, unitPart] = splitMark(record.mark);

      await db.query(
        'INSERT INTO marks (athlete_id, discipline, value, unit, record_date) VALUES ($1, $2, $3, $4, $5)',
        [athleteId, record.category, valuePart, unitPart, record.date]
      );
    }
  } catch (error) {
    if (requireDatabase()) throw error;
    console.warn('[content] saveRecords failed, falling back to local store.', error);
    const store = await readStore();
    store.records = records;
    await writeStore(store);
  }
}

function splitMark(mark: string): [number, string] {
  const numeric = parseFloat(mark.replace(',', '.'));
  if (!Number.isNaN(numeric)) {
    const unit = mark.replace(String(numeric), '').trim() || 's';
    return [numeric, unit];
  }
  return [0, mark];
}
