import express from 'express';
import path from 'node:path';
import { createDatabase } from './db';

const app = express();
const port = Number(process.env.PORT ?? 4174);
app.use(express.json());
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));
import { mountAuthRoutes } from './auth-routes';
import { ensureDemoUser } from './auth';
import { mountLetterRoutes } from './letter-routes';
import { sealLetter, readableLetter } from './sealing';
import { serverNow } from './time';
import { randomBytes } from 'node:crypto';

const resetTokens = new Map<string, { email: string; expiresAt: number }>();
app.post('/api/auth/password-reset', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'INVALID_EMAIL' });
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  if (!apiKey) return res.status(503).json({ error: 'RESEND_NOT_CONFIGURED' });
  const token = randomBytes(32).toString('hex');
  resetTokens.set(token, { email, expiresAt: Date.now() + 15 * 60 * 1000 });
  const origin = process.env.APP_ORIGIN || process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
  const resetUrl = `${origin}/?reset=${token}`;
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [email], subject: 'Temlore 密码重置', html: `<p>你好，</p><p>请点击下面的链接设置新的 Temlore 密码：</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>链接 15 分钟内有效。如非本人操作，请忽略此邮件。</p>` }) });
  if (!response.ok) return res.status(502).json({ error: 'RESEND_SEND_FAILED' });
  return res.json({ ok: true, resetUrl: process.env.NODE_ENV === 'production' ? undefined : resetUrl });
});
app.get('/api/time', (_req, res) => res.json({ now: serverNow().toISOString() }));
let databaseReady = false;
app.get('/api/health', (_req, res) => res.status(databaseReady ? 200 : 503).json({ ok: databaseReady, service: 'temlore', now: new Date().toISOString() }));
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) return res.sendFile(path.join(distPath, 'index.html'));
  return next();
});
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Temlore service listening on port ${port}`);
  try {
    const db = createDatabase(process.env.TEMLORE_DB ?? ':memory:');
    mountAuthRoutes(app, db);
    ensureDemoUser(db);
    mountLetterRoutes(app, db);
    app.post('/api/letters/:id/seal', (req, res) => { try { return res.json(sealLetter(db, Number(req.params.id), Number(req.body.userId), req.body.duration, req.body.customOpensAt)); } catch { return res.status(409).json({ error: 'LETTER_NOT_SEALABLE' }); } });
    app.get('/api/letters/:id/read', (req, res) => { try { return res.json(readableLetter(db, Number(req.params.id), Number(req.query.userId))); } catch (error) { return res.status((error as Error).message === 'LETTER_LOCKED' ? 423 : 404).json({ error: (error as Error).message }); } });
    databaseReady = true;
    console.log('Temlore database and routes ready');
  } catch (error) {
    console.error('Temlore database failed to initialize:', error);
    process.exitCode = 1;
  }
});
server.on('error', (error) => {
  console.error('Temlore service failed to start:', error);
  process.exitCode = 1;
});
