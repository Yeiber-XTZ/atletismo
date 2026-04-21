import { z } from 'zod';

export const ClubProfileSchema = z.object({
  clubId: z.coerce.number().int().positive(),
  coach: z.string().max(120).optional().or(z.literal('')),
  contactEmail: z.string().email().max(160).optional().or(z.literal('')),
  contactPhone: z.string().max(60).optional().or(z.literal('')),
  category: z.string().max(120).optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal(''))
});

export type ClubProfilePayload = z.infer<typeof ClubProfileSchema>;
