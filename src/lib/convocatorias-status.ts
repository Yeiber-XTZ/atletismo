const STATUS_UPCOMING = 'Pr\u00F3ximamente';
const STATUS_OPEN = 'Abierta';
const STATUS_CLOSED = 'Cerrada';

export function normalizeIsoDate(value: string | null | undefined) {
  const v = String(value ?? '').trim();
  if (!v) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return '';
  return `${m[1]}-${m[2]}-${m[3]}`;
}

function normalizeText(value: string | null | undefined) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function normalizeConvocatoriaStatus(value: string | null | undefined) {
  const raw = normalizeText(value);
  if (raw === 'abierta') return STATUS_OPEN;
  if (raw === 'cerrada') return STATUS_CLOSED;
  return STATUS_UPCOMING;
}

export function computeConvocatoriaStatus(input: { openDate?: string | null; closeDate?: string | null; now?: Date }) {
  const today = (input.now ?? new Date()).toISOString().slice(0, 10);
  const openDate = normalizeIsoDate(input.openDate);
  const closeDate = normalizeIsoDate(input.closeDate);

  if (closeDate && today > closeDate) return STATUS_CLOSED;
  if (openDate && today >= openDate && (!closeDate || today <= closeDate)) return STATUS_OPEN;
  return STATUS_UPCOMING;
}

export function manualStatusAllowed(input: {
  openDate?: string | null;
  closeDate?: string | null;
  status?: string | null;
  now?: Date;
}) {
  const today = (input.now ?? new Date()).toISOString().slice(0, 10);
  const openDate = normalizeIsoDate(input.openDate);
  const closeDate = normalizeIsoDate(input.closeDate);
  const status = normalizeConvocatoriaStatus(input.status);

  if (closeDate && today > closeDate) return status === STATUS_CLOSED;
  if (openDate && today < openDate) return status === STATUS_UPCOMING || status === STATUS_CLOSED;
  return status === STATUS_OPEN || status === STATUS_CLOSED;
}

export function resolveConvocatoriaStatus(input: {
  openDate?: string | null;
  closeDate?: string | null;
  statusMode?: string | null;
  manualStatus?: string | null;
  now?: Date;
}) {
  const mode = String(input.statusMode ?? 'auto').trim().toLowerCase() === 'manual' ? 'manual' : 'auto';
  const autoStatus = computeConvocatoriaStatus({ openDate: input.openDate, closeDate: input.closeDate, now: input.now });

  if (mode !== 'manual') {
    return { status: autoStatus, statusMode: 'auto' as const };
  }

  const manualStatus = normalizeConvocatoriaStatus(input.manualStatus);
  if (!manualStatusAllowed({ openDate: input.openDate, closeDate: input.closeDate, status: manualStatus, now: input.now })) {
    return { status: autoStatus, statusMode: 'auto' as const };
  }
  return { status: manualStatus, statusMode: 'manual' as const };
}
