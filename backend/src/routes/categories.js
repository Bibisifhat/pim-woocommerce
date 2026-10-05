import { Router } from 'express';
import { db } from '../db.js';

const r = Router();
r.get('/', (_req, res) => res.json(db.prepare('SELECT * FROM categories ORDER BY name').all()));
r.post('/', (req, res) => {
  if (!req.body.name) return res.status(400).json({ error: 'name required' });
  try {
    const info = db.prepare('INSERT INTO categories (name) VALUES (?)').run(req.body.name);
    res.status(201).json({ id: Number(info.lastInsertRowid), name: req.body.name });
  } catch { res.status(409).json({ error: 'Category exists' }); }
});
export default r;