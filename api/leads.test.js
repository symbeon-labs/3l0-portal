const test = require('node:test');
const assert = require('node:assert/strict');
const handler = require('./leads');

test.beforeEach(() => {
  process.env.LEADS_PRIVACY_APPROVED = 'true';
  process.env.LEADS_CONTROLLER_NAME = 'Controlador de teste';
  process.env.LEADS_PRIVACY_EMAIL = 'privacidade@example.com';
  process.env.LEADS_PRIVACY_URL = 'https://example.com/privacidade';
  process.env.LEADS_RETENTION_DAYS = '90';
});

function response() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; }
  };
}
function request(body, method = 'POST') {
  return { method, body, headers: { 'user-agent': 'node-test' } };
}
const validLead = () => ({
  name: 'Pessoa Teste',
  email: 'pessoa@example.com',
  organization: 'Empresa Teste',
  consent: true,
  sector: 'retail',
  role: 'decision_maker',
  useCase: 'receiving',
  workflow: 'manual',
  volume: 'daily',
  timeline: 'now'
});

test('rejects a use case that belongs to a different sector', async () => {
  process.env.LEADS_WEBHOOK_URL = 'https://hooks.example.com/leads';
  const req = request({ ...validLead(), useCase: 'compliance' });
  const res = response();
  await handler(req, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.payload.error, /qualificação/);
});

test('rejects a payload larger than 16 KiB', async () => {
  process.env.LEADS_WEBHOOK_URL = 'https://hooks.example.com/leads';
  const req = request({ ...validLead(), challenge: 'x'.repeat(17 * 1024) });
  const res = response();
  await handler(req, res);
  assert.equal(res.statusCode, 413);
});

test('rejects methods other than POST', async () => {
  const res = response();
  await handler(request({}, 'GET'), res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, 'POST');
});

test('does not claim delivery when the webhook is not configured', async () => {
  delete process.env.LEADS_WEBHOOK_URL;
  const res = response();
  await handler(request(validLead()), res);
  assert.equal(res.statusCode, 503);
  assert.notEqual(res.payload.ok, true);
});

test('forwards a valid lead and computes priority on the server', async (t) => {
  process.env.LEADS_WEBHOOK_URL = 'https://hooks.example.com/leads';
  const originalFetch = global.fetch;
  let sent;
  global.fetch = async (_url, options) => {
    sent = JSON.parse(options.body);
    return { ok: true, status: 200 };
  };
  t.after(() => { global.fetch = originalFetch; });
  const res = response();
  await handler(request(validLead()), res);
  assert.equal(res.statusCode, 201);
  assert.equal(res.payload.ok, true);
  assert.equal(sent.qualification.use_case, 'receiving');
  assert.equal(sent.sales_profile.priority, 'P1 — contato prioritário');
  assert.equal(sent.sales_profile.score, 8);
});


test('fails closed when privacy approval or required privacy details are missing', async () => {
  delete process.env.LEADS_PRIVACY_APPROVED;
  process.env.LEADS_WEBHOOK_URL = 'https://hooks.example.com/leads';
  const res = response();
  await handler(request(validLead()), res);
  assert.equal(res.statusCode, 503);
  assert.notEqual(res.payload.ok, true);
});
