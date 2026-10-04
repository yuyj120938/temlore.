import type { Express } from 'express';
import type { Database } from './db';
import { authenticate, register } from './auth';

export function mountAuthRoutes(app: Express, db: Database) {
  app.post('/api/auth/register', (req, res) => {
    try { const result = register(db, String(req.body.phone ?? ''), String(req.body.password ?? '')); res.status(201).json(result); }
    catch { res.status(400).json({ error: '无法创建账号' }); }
  });
  app.post('/api/auth/login', (req, res) => {
    try { const user = authenticate(db, String(req.body.phone ?? ''), String(req.body.password ?? '')); res.json({ user }); }
    catch { res.status(401).json({ error: '手机号或密码不正确' }); }
  });
}
