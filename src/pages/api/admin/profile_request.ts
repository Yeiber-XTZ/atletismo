import type { APIRoute } from 'astro';
import { createApprovalRequest } from '../../../lib/approvals';
import { logAudit } from '../../../lib/audit';
import { redirectInternal } from '../../../lib/http-redirect';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return redirectInternal('/login', 302);
  }

  const formData = await request.formData();
  
  // Extraer la información enviada
  const payload: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      payload[key] = value;
    }
  }

  try {
    // Crear la solicitud de aprobación (modulo: profile_update)
    const entityId = user.clubId ? String(user.clubId) : String(user.id);
    
    await createApprovalRequest({
      module: 'profile_update',
      action: 'update_info',
      entityId: entityId,
      payload: payload,
      requestedBy: user.id
    });
    
    await logAudit({
      userId: user.id,
      action: 'request_profile_update',
      entityType: 'approval_requests',
      meta: { clubId: user.clubId },
      request
    });

    return redirectInternal('/admin?tab=perfil&saved=1', 302);
  } catch (err) {
    console.error('Error al manejar solicitud de perfil:', err);
    return redirectInternal('/admin?tab=perfil&error=1', 302);
  }
};


