import express from 'express';
import { createDatabase } from './db';

const app = express();
const port = Number(process.env.PORT ?? 4174);
const db = createDatabase(process.env.TEMLORE_DB ?? ':memory:');
app.use(express.json());
import { mountAuthRoutes } from './auth-routes';
import { mountLetterRoutes } from './letter-routes';
import { sealLetter, readableLetter } from './sealing';
import { serverNow } from './time';
mountAuthRoutes(app, db);
mountLetterRoutes(app, db);
app.post('/api/letters/:id/seal', (req, res) => { try { return res.json(sealLetter(db, Number(req.params.id), Number(req.body.userId), req.body.duration, req.body.customOpensAt)); } catch { return res.status(409).json({ error: 'LETTER_NOT_SEALABLE' }); } });
app.get('/api/letters/:id/read', (req, res) => { try { return res.json(readableLetter(db, Number(req.params.id), Number(req.query.userId))); } catch (error) { return res.status((error as Error).message === 'LETTER_LOCKED' ? 423 : 404).json({ error: (error as Error).message }); } });
app.get('/api/time', (_req, res) => res.json({ now: serverNow().toISOString() }));
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'temlore', now: new Date().toISOString() }));
app.listen(port, () => console.log(`Temlore service listening on http://localhost:${port}`));
