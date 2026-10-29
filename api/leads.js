// Vercel Serverless Function: validates and forwards leads to a privately configured CRM/n8n webhook.
const USE_CASES = {
  industry: ['traceability','receiving','quality','records','other'],
  retail: ['receiving','invoice','catalog','stock','other'],
  logistics: ['receiving','documents','tracking','exceptions','other'],
  services: ['documents','records','compliance','integration','other'],
  health: ['documents','traceability','quality','integration','other'],
  agribusiness: ['traceability','receiving','documents','quality','other'],
  other: ['documents','receiving','reconcile','integration','other']
};
// Configure LEADS_WEBHOOK_URL in Vercel Project Settings → Environment Variables.
// Never place the webhook URL or credentials in client-side code.
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  // Fail closed until the controller has explicitly approved lead capture and the
  // public privacy notice identifies the responsible party, contact channel and retention.
  const privacyApproved = process.env.LEADS_PRIVACY_APPROVED === 'true';
  const controllerName = (process.env.LEADS_CONTROLLER_NAME || '').trim();
  const privacyEmail = (process.env.LEADS_PRIVACY_EMAIL || '').trim();
  const privacyUrl = (process.env.LEADS_PRIVACY_URL || '').trim();
  const retentionDays = Number(process.env.LEADS_RETENTION_DAYS || 0);
  let validPrivacyUrl = false;
  try { validPrivacyUrl = new URL(privacyUrl).protocol === 'https:'; } catch (_) {}
  if (!privacyApproved || !controllerName || !/^\S+@\S+\.\S+$/.test(privacyEmail) ||
      !validPrivacyUrl || !Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 3650) {
    return res.status(503).json({
      error: 'A captação de solicitações ainda não foi ativada. O aviso de privacidade e as condições de tratamento precisam ser concluídos.'
    });
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

  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  // Reject unexpectedly large payloads even when the platform has already parsed the body.
  if (Buffer.byteLength(JSON.stringify(body), 'utf8') > 16 * 1024) {
    return res.status(413).json({ error: 'A solicitação excede o tamanho permitido.' });
  }
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
      typeof body.useCase !== 'string' || body.useCase.length > 80 ||
      !USE_CASES[body.sector]?.includes(body.useCase)) {
    return res.status(400).json({ error: 'As respostas de qualificação são inválidas. Recarregue a página e tente novamente.' });
  }

  // Calculate priority on the server from validated answers; never trust the browser's score.
  let score = 0;
  if (body.timeline === 'now') score += 3; else if (body.timeline === 'quarter') score += 2;
  if (body.role === 'decision_maker') score += 2; else if (body.role === 'technical' || body.role === 'operations') score += 1;
  if (body.volume === 'daily_high' || body.volume === 'daily') score += 2; else if (body.volume === 'weekly') score += 1;
  if (body.workflow === 'manual' || body.workflow === 'mixed') score += 1;
  const priority = score >= 6 ? 'P1 — contato prioritário' : score >= 3 ? 'P2 — qualificação comercial' : 'P3 — nutrição e descoberta';
  const approaches = {
    now: 'Entender urgência, impacto e possibilidade de caso-piloto.',
    quarter: 'Validar requisitos, envolvidos na decisão e critérios de sucesso.',
    exploring: 'Compartilhar contexto e explorar aderência antes de propor piloto.',
    research: 'Compartilhar contexto e explorar aderência antes de propor piloto.'
  };
  const sectorLabels = {industry:'Indústria e manufatura',retail:'Varejo e distribuição',logistics:'Logística e cadeia de suprimentos',services:'Serviços profissionais',health:'Saúde e laboratórios',agribusiness:'Agro e produção rural',other:'Outro setor'};
  const roleLabels = {decision_maker:'Decisor/aprovador',technical:'Tecnologia, dados ou inovação',operations:'Operação ou processo',influencer:'Pesquisa e recomendação',consultant:'Consultor ou parceiro',other:'Outro papel'};
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
      score,
      priority,
      suggested_approach: approaches[body.timeline],
      sector_label: sectorLabels[body.sector],
      role_label: roleLabels[body.role],
      use_case_label: clean(body.useCase, 120),
      current_workflow: body.workflow,
      frequency: body.volume,
      timeline: body.timeline
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
