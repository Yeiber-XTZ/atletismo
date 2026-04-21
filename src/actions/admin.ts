import { defineAction, z } from 'astro:actions';
import { setSessionCookie } from '../lib/auth';
import { saveEvents, saveFederation, saveHero, saveRecords, saveSettings } from '../lib/content';

const jsonText = z.string().min(2);

export const server = {
  login: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email(),
      password: z.string().min(6)
    }),
    handler: async (input, context) => {
      const adminEmail = import.meta.env.ADMIN_EMAIL;
      const adminPassword = import.meta.env.ADMIN_PASSWORD;

      if (!adminEmail || !adminPassword) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required.');
      }

      if (input.email !== adminEmail || input.password !== adminPassword) {
        return { ok: false, error: 'Credenciales invalidas.' };
      }

      setSessionCookie(context.cookies, input.email);
      return { ok: true };
    }
  }),

  updateHero: defineAction({
    accept: 'form',
    input: z.object({
      title: z.string().min(3),
      subtitle: z.string().min(3),
      imageUrl: z.string().optional().default('')
    }),
    handler: async (input) => {
      await saveHero({
        title: input.title,
        subtitle: input.subtitle,
        imageUrl: input.imageUrl ?? ''
      });
      return { ok: true };
    }
  }),

  updateSettings: defineAction({
    accept: 'form',
    input: z.object({
      siteName: z.string().min(2),
      logoUrl: z.string().optional().default(''),
      primaryColor: z.string().min(4),
      secondaryColor: z.string().min(4),
      contactEmail: z.string().email().optional().default(''),
      contactPhone: z.string().optional().default(''),
      socialJson: z.string().optional().default('{}')
    }),
    handler: async (input) => {
      const social = parseObjectJson(input.socialJson ?? '{}', 'redes sociales');
      await saveSettings({
        siteName: input.siteName,
        logoUrl: input.logoUrl ?? '',
        primaryColor: input.primaryColor,
        secondaryColor: input.secondaryColor,
        contactEmail: input.contactEmail ?? '',
        contactPhone: input.contactPhone ?? '',
        social
      });
      return { ok: true };
    }
  }),

  updateFederation: defineAction({
    accept: 'form',
    input: z.object({
      about: z.string().min(3),
      mission: z.string().min(3),
      vision: z.string().min(3)
    }),
    handler: async (input) => {
      await saveFederation({
        about: input.about,
        mission: input.mission,
        vision: input.vision
      });
      return { ok: true };
    }
  }),

  updateEvents: defineAction({
    accept: 'form',
    input: z.object({
      eventsJson: jsonText
    }),
    handler: async (input) => {
      const parsed = parseJson(input.eventsJson, 'events');
      await saveEvents(parsed);
      return { ok: true };
    }
  }),

  updateRecords: defineAction({
    accept: 'form',
    input: z.object({
      recordsJson: jsonText
    }),
    handler: async (input) => {
      const parsed = parseJson(input.recordsJson, 'records');
      await saveRecords(parsed);
      return { ok: true };
    }
  })
};

function parseJson(value: string, label: string) {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      throw new Error('Se esperaba un array JSON.');
    }
    return parsed as Array<Record<string, unknown>>;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'JSON invalido';
    throw new Error(`Error en ${label}: ${message}`);
  }
}

function parseObjectJson(value: string, label: string) {
  try {
    const parsed = JSON.parse(value);
    if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
      throw new Error('Se esperaba un objeto JSON.');
    }
    return parsed as Record<string, string>;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'JSON invalido';
    throw new Error(`Error en ${label}: ${message}`);
  }
}
