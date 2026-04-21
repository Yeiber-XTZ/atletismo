import type { PqrsStatus } from './pqrs';

type NotifyInput = {
  to: string;
  radicado: string;
  previousStatus: PqrsStatus;
  currentStatus: PqrsStatus;
};

function getMailWebhookUrl() {
  const value = import.meta.env.MAIL_WEBHOOK_URL;
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

export async function notifyPqrsStatusChange(input: NotifyInput) {
  const webhook = getMailWebhookUrl();
  if (!webhook) {
    return;
  }

  const subject = `Actualización PQRS ${input.radicado}: ${input.currentStatus}`;
  const text = `Tu solicitud ${input.radicado} cambió de ${input.previousStatus} a ${input.currentStatus}.`;

  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        to: input.to,
        subject,
        text,
        template: 'pqrs-status-change',
        data: {
          radicado: input.radicado,
          previousStatus: input.previousStatus,
          currentStatus: input.currentStatus
        }
      })
    });
  } catch (error) {
    console.warn('[pqrs] notification failed:', (error as Error)?.message ?? error);
  }
}
