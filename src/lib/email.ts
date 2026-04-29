import { createRequire } from 'node:module';

type ClubApprovedEmailInput = {
  to: string;
  nombreOrganizacion: string;
  adminName?: string;
  loginUrl?: string;
};

function getEnv(name: string) {
  const value = import.meta.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

function createTransporter() {
  const user = getEnv('EMAIL_USER');
  const pass = getEnv('EMAIL_PASSWORD');
  if (!user || !pass) return null;

  const require = createRequire(import.meta.url);
  let nodemailerLib: any;
  try {
    nodemailerLib = require('nodemailer');
  } catch {
    console.warn('[mail] nodemailer no está instalado; se omite envío de correo.');
    return null;
  }

  return nodemailerLib.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass }
  });
}

function buildClubApprovedEmail(input: Omit<ClubApprovedEmailInput, 'to'>) {
  const subject = 'Solicitud aprobada - Liga de Atletismo del Choco';
  const textBody =
    `Hola,\n\n` +
    `La solicitud de registro del club "${input.nombreOrganizacion}" fue aprobada para hacer parte de la Liga de Atletismo del Choco.\n\n` +
    `Datos del club:\n` +
    `- Club: ${input.nombreOrganizacion}\n` +
    `${input.adminName ? `- Administrador: ${input.adminName}\n` : ''}\n` +
    `Ya puedes iniciar sesion con el correo registrado y la contrasena definida durante el registro.\n\n` +
    `${input.loginUrl ? `Acceso: ${input.loginUrl}\n\n` : ''}` +
    `Si no reconoces esta solicitud, responde a este correo.\n\n` +
    `Saludos,\n` +
    `Equipo Liga de Atletismo del Choco\n`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.7;
        color: #0f172a;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        padding: 40px 20px;
      }
      .email-wrapper { max-width: 640px; margin: 0 auto; }
      .container {
        background-color: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,0.35);
      }
      .header {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        padding: 42px 40px;
        text-align: center;
      }
      .logo-icon { font-size: 42px; margin-bottom: 14px; display: inline-block; color: #e7d916; }
      .header h1 {
        font-size: 28px;
        font-weight: 700;
        color: #f8fafc;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }
      .header-subtitle {
        font-size: 12px;
        color: rgba(248, 250, 252, 0.7);
        margin-top: 8px;
        letter-spacing: 3px;
        text-transform: uppercase;
      }
      .content { padding: 40px; background-color: #ffffff; }
      .content-inner { font-size: 16px; color: #334155; line-height: 1.8; }
      .content-inner p { margin-bottom: 14px; }
      .content-inner strong { color: #0f172a; font-weight: 600; }
      .highlight-box {
        background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
        border-left: 4px solid #5AAC32;
        padding: 18px 22px;
        margin: 22px 0;
        border-radius: 10px;
      }
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #5AAC32 0%, #4a9528 100%);
        color: #ffffff;
        padding: 12px 22px;
        text-decoration: none;
        border-radius: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        box-shadow: 0 8px 18px rgba(90, 172, 50, 0.25);
      }
      .footer {
        background: #f8fafc;
        padding: 28px 32px;
        text-align: center;
        border-top: 1px solid #e2e8f0;
      }
      .footer-text { font-size: 13px; color: #64748b; margin-bottom: 8px; line-height: 1.6; }
      .company-info { font-size: 12px; color: #94a3b8; }
      @media only screen and (max-width: 600px) {
        body { padding: 20px 10px; }
        .content { padding: 28px 24px; }
        .header { padding: 34px 24px; }
        .header h1 { font-size: 24px; }
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="container">
        <div class="header">
          <div class="logo-icon">★</div>
          <h1>Liga de Atletismo</h1>
          <div class="header-subtitle">Departamento del Choco</div>
        </div>
        <div class="content">
          <div class="content-inner">
            <p>Hola,</p>
            <p>
              La solicitud de registro del club
              <strong>${input.nombreOrganizacion}</strong> fue aprobada para hacer parte de la Liga.
            </p>
            <div class="highlight-box">
              <p><strong>Club:</strong> ${input.nombreOrganizacion}</p>
              ${input.adminName ? `<p><strong>Administrador:</strong> ${input.adminName}</p>` : ''}
            </div>
            <p>
              Ya puedes iniciar sesion con el correo registrado y la contrasena definida durante el registro.
            </p>
            ${input.loginUrl ? `<p style="margin-top: 18px;"><a href="${input.loginUrl}" class="cta-button">Ir al login</a></p>` : ''}
            <p style="color:#64748b; font-size: 0.9rem;">
              Si no reconoces esta solicitud, por favor responde a este correo.
            </p>
            <p>Saludos,<br />Equipo Liga de Atletismo del Choco</p>
          </div>
        </div>
        <div class="footer">
          <div class="footer-text">Este mensaje fue generado automaticamente por la plataforma de la Liga.</div>
          <div class="company-info">Liga de Atletismo del Choco · Gestion deportiva integral</div>
        </div>
      </div>
    </div>
  </body>
</html>
  `.trim();

  return { subject, textBody, htmlBody };
}

export async function sendClubApprovalEmail(input: ClubApprovedEmailInput) {
  const transporter = createTransporter();
  const from = getEnv('EMAIL_FROM') || getEnv('EMAIL_USER');
  if (!transporter || !from || !input.to) return;

  const { subject, textBody, htmlBody } = buildClubApprovedEmail({
    nombreOrganizacion: input.nombreOrganizacion,
    adminName: input.adminName,
    loginUrl: input.loginUrl
  });

  try {
    await transporter.sendMail({
      from,
      to: input.to,
      subject,
      text: textBody,
      html: htmlBody
    });
  } catch (error) {
    console.warn('[mail] club approval email failed:', (error as Error)?.message ?? error);
  }
}

type ProfileUpdateReviewEmailInput = {
  to: string;
  displayName?: string;
  decision: 'approved' | 'rejected';
  reviewNotes?: string;
  loginUrl?: string;
};

function buildProfileUpdateReviewEmail(input: Omit<ProfileUpdateReviewEmailInput, 'to'>) {
  const approved = input.decision === 'approved';
  const subject = approved
    ? 'Solicitud de cambio de perfil aprobada - Liga de Atletismo del Choco'
    : 'Solicitud de cambio de perfil rechazada - Liga de Atletismo del Choco';

  const statusText = approved ? 'aprobada' : 'rechazada';
  const textBody =
    `Hola${input.displayName ? ` ${input.displayName}` : ''},\n\n` +
    `Tu solicitud de cambio de perfil fue ${statusText}.\n\n` +
    `${input.reviewNotes ? `Notas de revision:\n${input.reviewNotes}\n\n` : ''}` +
    `${approved
      ? 'Los cambios solicitados ya fueron aplicados en tu cuenta.\n\n'
      : 'Tus datos actuales se mantienen sin cambios.\n\n'}` +
    `${input.loginUrl ? `Puedes ingresar aqui: ${input.loginUrl}\n\n` : ''}` +
    `Saludos,\nEquipo Liga de Atletismo del Choco\n`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.7;
        color: #0f172a;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        padding: 40px 20px;
      }
      .email-wrapper { max-width: 640px; margin: 0 auto; }
      .container { background-color: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.35); }
      .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 36px 32px; text-align: center; }
      .header h1 { font-size: 24px; font-weight: 800; color: #f8fafc; text-transform: uppercase; }
      .header-subtitle { font-size: 11px; color: rgba(248,250,252,.75); margin-top: 6px; letter-spacing: .2em; text-transform: uppercase; }
      .content { padding: 32px; }
      .badge {
        display: inline-block; padding: 6px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em;
        background: ${approved ? '#dcfce7' : '#fee2e2'};
        color: ${approved ? '#166534' : '#991b1b'};
      }
      .box { margin-top: 16px; background: #f8fafc; border-left: 4px solid #5AAC32; padding: 14px 16px; border-radius: 8px; }
      .cta {
        display: inline-block; margin-top: 18px; background: linear-gradient(135deg, #5AAC32 0%, #4a9528 100%);
        color: #fff; text-decoration: none; border-radius: 10px; padding: 11px 18px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase;
      }
      .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 28px; color: #64748b; font-size: 12px; text-align: center; }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="container">
        <div class="header">
          <h1>Liga de Atletismo</h1>
          <div class="header-subtitle">Departamento del Choco</div>
        </div>
        <div class="content">
          <p>Hola${input.displayName ? ` <strong>${input.displayName}</strong>` : ''},</p>
          <p style="margin-top:10px;">Tu solicitud de cambio de perfil fue <strong>${statusText}</strong>.</p>
          <div class="badge">${approved ? 'Aprobada' : 'Rechazada'}</div>
          ${input.reviewNotes ? `<div class="box"><strong>Notas de revision:</strong><br />${input.reviewNotes}</div>` : ''}
          <p style="margin-top:14px;">
            ${approved ? 'Los cambios solicitados ya fueron aplicados en tu cuenta.' : 'Tus datos actuales se mantienen sin cambios.'}
          </p>
          ${input.loginUrl ? `<a href="${input.loginUrl}" class="cta">Ir al login</a>` : ''}
        </div>
        <div class="footer">Este mensaje fue generado automaticamente por la plataforma de la Liga.</div>
      </div>
    </div>
  </body>
</html>
  `.trim();

  return { subject, textBody, htmlBody };
}

export async function sendProfileUpdateReviewEmail(input: ProfileUpdateReviewEmailInput) {
  const transporter = createTransporter();
  const from = getEnv('EMAIL_FROM') || getEnv('EMAIL_USER');
  if (!transporter || !from || !input.to) return;

  const { subject, textBody, htmlBody } = buildProfileUpdateReviewEmail({
    displayName: input.displayName,
    decision: input.decision,
    reviewNotes: input.reviewNotes,
    loginUrl: input.loginUrl
  });

  try {
    await transporter.sendMail({
      from,
      to: input.to,
      subject,
      text: textBody,
      html: htmlBody
    });
  } catch (error) {
    console.warn('[mail] profile update review email failed:', (error as Error)?.message ?? error);
  }
}

type DocumentReviewEmailInput = {
  to: string;
  displayName?: string;
  decision: 'approved' | 'rejected';
  reviewNotes?: string;
  documentTitle?: string;
  loginUrl?: string;
};

function buildDocumentReviewEmail(input: Omit<DocumentReviewEmailInput, 'to'>) {
  const approved = input.decision === 'approved';
  const subject = approved
    ? 'Solicitud de documento aprobada - Liga de Atletismo del Choco'
    : 'Solicitud de documento rechazada - Liga de Atletismo del Choco';
  const statusText = approved ? 'aprobada' : 'rechazada';
  const docLine = input.documentTitle ? `Documento: ${input.documentTitle}\n` : '';

  const textBody =
    `Hola${input.displayName ? ` ${input.displayName}` : ''},\n\n` +
    `Tu solicitud de documento fue ${statusText}.\n` +
    `${docLine}\n` +
    `${input.reviewNotes ? `Notas de revision:\n${input.reviewNotes}\n\n` : ''}` +
    `${approved
      ? 'El documento fue publicado correctamente.\n\n'
      : 'El documento no fue publicado. Puedes ajustarlo y enviarlo nuevamente.\n\n'}` +
    `${input.loginUrl ? `Puedes ingresar aqui: ${input.loginUrl}\n\n` : ''}` +
    `Saludos,\nEquipo Liga de Atletismo del Choco\n`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="font-family: Inter, Segoe UI, sans-serif; background:#f8fafc; padding:24px; color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:#0f172a;color:#f8fafc;padding:20px 24px;">
        <h1 style="margin:0;font-size:18px;">Liga de Atletismo del Choco</h1>
      </div>
      <div style="padding:24px;">
        <p>Hola${input.displayName ? ` <strong>${input.displayName}</strong>` : ''},</p>
        <p>Tu solicitud de documento fue <strong>${statusText}</strong>.</p>
        ${input.documentTitle ? `<p><strong>Documento:</strong> ${input.documentTitle}</p>` : ''}
        ${input.reviewNotes ? `<p><strong>Notas de revision:</strong><br />${input.reviewNotes}</p>` : ''}
        <p>${approved ? 'El documento fue publicado correctamente.' : 'El documento no fue publicado. Puedes ajustarlo y enviarlo nuevamente.'}</p>
        ${input.loginUrl ? `<p><a href="${input.loginUrl}" style="display:inline-block;background:#5AAC32;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;">Ir al login</a></p>` : ''}
      </div>
    </div>
  </body>
</html>
  `.trim();

  return { subject, textBody, htmlBody };
}

export async function sendDocumentReviewEmail(input: DocumentReviewEmailInput) {
  const transporter = createTransporter();
  const from = getEnv('EMAIL_FROM') || getEnv('EMAIL_USER');
  if (!transporter || !from || !input.to) return;

  const { subject, textBody, htmlBody } = buildDocumentReviewEmail({
    displayName: input.displayName,
    decision: input.decision,
    reviewNotes: input.reviewNotes,
    documentTitle: input.documentTitle,
    loginUrl: input.loginUrl
  });

  try {
    await transporter.sendMail({
      from,
      to: input.to,
      subject,
      text: textBody,
      html: htmlBody
    });
  } catch (error) {
    console.warn('[mail] document review email failed:', (error as Error)?.message ?? error);
  }
}
