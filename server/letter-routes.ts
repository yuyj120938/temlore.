import type { Express } from 'express';
import type Database from 'better-sqlite3';
import { createLetter, getLetter, saveDraft } from './letters';

export function mountLetterRoutes(app: Express, db: Database.Database) {
  app.post('/api/letters', (req, res) => { const id = createLetter(db, Number(req.body.userId)); res.status(201).json({ id }); });
  app.get('/api/letters/:id', (req, res) => { const letter = getLetter(db, Number(req.params.id), Number(req.query.userId)); if (!letter) return res.status(404).json({ error: 'NOT_FOUND' }); return res.json(letter); });
  app.patch('/api/letters/:id/draft', (req, res) => { try { const result = saveDraft(db, Number(req.params.id), Number(req.body.userId), String(req.body.body ?? ''), req.body.font === 'kaiti' ? 'kaiti' : 'songti'); return res.json(result); } catch { return res.status(409).json({ error: 'DRAFT_NOT_EDITABLE' }); } });
}
