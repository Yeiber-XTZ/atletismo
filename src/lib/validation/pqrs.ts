import { z } from 'zod';

export const PqrsUpdateSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(['PENDIENTE', 'EN TRAMITE', 'RESUELTO']),
  assignedTo: z.string().max(160).optional().or(z.literal('')),
  responseNote: z.string().max(4000).optional().or(z.literal(''))
});

export type PqrsUpdatePayload = z.infer<typeof PqrsUpdateSchema>;
