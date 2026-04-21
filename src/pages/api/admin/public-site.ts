import type { APIRoute } from 'astro';
import { getAdminData, upsertPublicSite } from '../../../lib/admin';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { saveFileUpload } from '../../../lib/file-upload';

function parseLines(value: string, columns: number) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split('|').map((col) => col.trim()))
    .filter((parts) => parts.length >= columns);
}

function getTrimmedValues(form: FormData, key: string) {
  return form.getAll(key).map((value) => String(value ?? '').trim());
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'site:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const data = await getAdminData();
  const current = data.publicSite;
  const form = await request.formData();
  const ownerId = Number(auth.user.id) || null;

  const heroKeys = ['laLiga', 'convocatorias', 'competencias', 'calendario', 'resultados', 'ranking', 'clubes', 'noticias', 'blog'] as const;
  const pageHeroes: Record<string, string> = { ...(current?.pageHeroes ?? {}) };

  for (const key of heroKeys) {
    let value = String(form.get(`pageHero_${key}`) ?? pageHeroes[key] ?? '').trim();
    const file = form.get(`pageHeroFile_${key}`);
    if (file instanceof File && file.size > 0) {
      const uploaded = await saveFileUpload(file, ownerId);
      if (uploaded) value = uploaded;
    }
    pageHeroes[key] = value;
  }

  let historyImageUrl = String(form.get('laLigaHistoryImageUrl') ?? current?.laLiga?.historyImageUrl ?? '').trim();
  const historyFile = form.get('laLigaHistoryImageFile');
  if (historyFile instanceof File && historyFile.size > 0) {
    const uploaded = await saveFileUpload(historyFile, ownerId);
    if (uploaded) historyImageUrl = uploaded;
  }

  const principleIcons = getTrimmedValues(form, 'principleIcon');
  const principleTitles = getTrimmedValues(form, 'principleTitle');
  const principleDescs = getTrimmedValues(form, 'principleDesc');
  const principleSize = Math.max(principleIcons.length, principleTitles.length, principleDescs.length);
  const principles = Array.from({ length: principleSize }, (_, index) => ({
    icon: principleIcons[index] || 'star',
    title: principleTitles[index] || '',
    desc: principleDescs[index] || ''
  })).filter((item) => item.title && item.desc);

  const governanceLabels = getTrimmedValues(form, 'governanceLabel');
  const governanceTitles = getTrimmedValues(form, 'governanceTitle');
  const governanceSize = Math.max(governanceLabels.length, governanceTitles.length);
  const governanceItems = Array.from({ length: governanceSize }, (_, index) => ({
    label: governanceLabels[index] || '',
    title: governanceTitles[index] || ''
  })).filter((item) => item.label && item.title);

  const normativeIcons = getTrimmedValues(form, 'normativeIcon');
  const normativeTitles = getTrimmedValues(form, 'normativeTitle');
  const normativeHrefs = getTrimmedValues(form, 'normativeHref');
  const normativeSize = Math.max(normativeIcons.length, normativeTitles.length, normativeHrefs.length);
  const normativeDocs = Array.from({ length: normativeSize }, (_, index) => ({
    icon: normativeIcons[index] || 'menu_book',
    title: normativeTitles[index] || '',
    href: normativeHrefs[index] || '/documentos'
  })).filter((item) => item.title && item.href);

  const principlesRaw = String(form.get('laLigaPrinciples') ?? '');
  const governanceRaw = String(form.get('laLigaGovernance') ?? '');
  const normativeRaw = String(form.get('laLigaNormativeDocs') ?? '');
  const legacyPrinciples = parseLines(principlesRaw, 3).map((parts) => ({
    icon: parts[0] || 'star',
    title: parts[1] || '',
    desc: parts[2] || ''
  }));
  const legacyGovernance = parseLines(governanceRaw, 2).map((parts) => ({
    label: parts[0] || '',
    title: parts[1] || ''
  }));
  const legacyNormative = parseLines(normativeRaw, 3).map((parts) => ({
    icon: parts[0] || 'menu_book',
    title: parts[1] || '',
    href: parts[2] || '/documentos'
  }));

  await upsertPublicSite({
    pageHeroes,
    laLiga: {
      heroTitle: String(form.get('laLigaHeroTitle') ?? current?.laLiga?.heroTitle ?? 'La Liga').trim(),
      heroSubtitle: String(form.get('laLigaHeroSubtitle') ?? current?.laLiga?.heroSubtitle ?? '').trim(),
      historyImageUrl,
      principles: principles.length ? principles : legacyPrinciples.length ? legacyPrinciples : current?.laLiga?.principles ?? [],
      governanceItems: governanceItems.length ? governanceItems : legacyGovernance.length ? legacyGovernance : current?.laLiga?.governanceItems ?? [],
      normativeDocs: normativeDocs.length ? normativeDocs : legacyNormative.length ? legacyNormative : current?.laLiga?.normativeDocs ?? []
    }
  });

  return Response.redirect(new URL('/admin?tab=liga-publica&saved=1', request.url), 302);
};
