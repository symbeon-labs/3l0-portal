// Vercel Serverless Function: forwards qualified leads to a privately configured CRM/n8n webhook.
// Configure LEADS_WEBHOOK_URL in Vercel Project Settings → Environment Variables.
// Never place the webhook URL or credentials in client-side code.
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const webhook = process.env.LEADS_WEBHOOK_URL;
  if (!webhook) {
    return res.status(503).json({
      error: 'O recebimento de solicitações ainda não foi ativado. Tente novamente mais tarde.'
    });
  }

  let endpoint;
  try {
    endpoint = new URL(webhook);
    if (endpoint.protocol !== 'https:') throw new Error('HTTPS required');
  } catch (_) {
    return res.status(503).json({ error: 'O destino de recebimento não está configurado corretamente.' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  // Honeypot: return a generic success to bots without forwarding anything.
  if (typeof body.website === 'string' && body.website.trim()) {
    return res.status(202).json({ ok: true });
  }

  const clean = (value, max = 500) =>
    typeof value === 'string' ? value.trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max) : '';
  const email = clean(body.email, 180).toLowerCase();
  const name = clean(body.name, 100);
  const organization = clean(body.organization, 160);
  const allowed = (value, values) => typeof value === 'string' && values.includes(value);

  if (!name || !organization || !/^\S+@\S+\.\S+$/.test(email) || body.consent !== true) {
    return res.status(400).json({ error: 'Revise os campos obrigatórios e o consentimento.' });
  }
  if (!allowed(body.sector, ['industry','retail','logistics','services','health','agribusiness','other']) ||
      !allowed(body.role, ['decision_maker','technical','operations','influencer','consultant','other']) ||
      !allowed(body.workflow, ['manual','systems','mixed','outsourced','undefined']) ||
      !allowed(body.volume, ['daily_high','daily','weekly','monthly','pilot']) ||
      !allowed(body.timeline, ['now','quarter','exploring','research']) ||
      typeof body.useCase !== 'string' || body.useCase.length > 80) {
    return res.status(400).json({ error: 'As respostas de qualificação são inválidas. Recarregue a página e tente novamente.' });
  }

  const profile = body.profile && typeof body.profile === 'object' ? body.profile : {};
  const lead = {
    event: '3l0.portal.lead.created',
    source: '3l0-portal',
    submitted_at: new Date().toISOString(),
    contact: {
      name,
      email,
      organization,
      phone: clean(body.phone, 40) || null,
      consent: true
    },
    qualification: {
      sector: body.sector,
      role: body.role,
      use_case: clean(body.useCase, 80),
      current_workflow: body.workflow,
      frequency: body.volume,
      timeline: body.timeline,
      challenge: clean(body.challenge, 1200) || null
    },
    sales_profile: {
      score: Number.isFinite(profile.qualification_score) ? Math.max(0, Math.min(8, profile.qualification_score)) : null,
      priority: clean(profile.priority, 80) || 'Pendente de qualificação',
      suggested_approach: clean(profile.approach, 300) || null,
      sector_label: clean(profile.sector_label, 100),
      role_label: clean(profile.role_label, 100),
      use_case_label: clean(profile.use_case_label, 120),
      workflow_label: clean(profile.workflow_label, 100),
      volume_label: clean(profile.volume_label, 100),
      timeline_label: clean(profile.timeline_label, 100)
    },
    metadata: {
      page: clean(body.page, 200),
      user_agent: clean(req.headers['user-agent'], 300)
    }
  };

  try {
    const response = await fetch(endpoint.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) {
      return res.status(502).json({ error: 'Não foi possível encaminhar sua solicitação. Tente novamente mais tarde.' });
    }
    return res.status(201).json({ ok: true });
  } catch (_) {
    return res.status(502).json({ error: 'Não foi possível encaminhar sua solicitação. Tente novamente mais tarde.' });
  }
};
