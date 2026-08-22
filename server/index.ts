import express from 'express';
import { createDatabase } from './db';

const app = express();
const port = Number(process.env.PORT ?? 4174);
const db = createDatabase(process.env.TEMLORE_DB ?? ':memory:');
app.use(express.json());
import { mountAuthRoutes } from './auth-routes';
import { mountLetterRoutes } from './letter-routes';
mountAuthRoutes(app, db);
mountLetterRoutes(app, db);
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'temlore', now: new Date().toISOString() }));
app.listen(port, () => console.log(`Temlore service listening on http://localhost:${port}`));
