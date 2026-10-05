import { Router } from 'express';
import { db } from '../db.js';

const r = Router();
const FIELDS = ['sku','name','description','price','stock','brand','color','size','material','category_id'];
const pick = (b) => FIELDS.map((f) => (b[f] === '' || b[f] === undefined ? null : b[f]));

r.get('/', (req, res) => {
  const { search = '', category = '' } = req.query;
  let sql = `SELECT p.*, c.name AS category_name FROM products p
             LEFT JOIN categories c ON c.id = p.category_id WHERE 1=1`;
  const args = [];
  if (search) {
    sql += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.brand LIKE ?)';
    const s = `%${search}%`; args.push(s, s, s);
  }
  if (category) { sql += ' AND p.category_id = ?'; args.push(category); }
  sql += ' ORDER BY p.updated_at DESC, p.id DESC';
  res.json(db.prepare(sql).all(...args));
});

r.get('/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  p ? res.json(p) : res.status(404).json({ error: 'Not found' });
});

r.post('/', (req, res) => {
  const v = pick(req.body);
  if (!req.body.name || !req.body.sku || req.body.price == null)
    return res.status(400).json({ error: 'name, sku and price are required' });
  try {
    const info = db.prepare(`INSERT INTO products
      (${FIELDS.join(',')}) VALUES (${FIELDS.map(() => '?').join(',')})`).run(...v);
    res.status(201).json(db.prepare('SELECT * FROM products WHERE id = ?').get(Number(info.lastInsertRowid)));
  } catch (e) {
    res.status(e.message.includes('UNIQUE') ? 409 : 500).json({ error: e.message.includes('UNIQUE') ? 'SKU already exists' : e.message });
  }
});

r.put('/:id', (req, res) => {
  const v = pick(req.body);
  try {
    const info = db.prepare(`UPDATE products SET ${FIELDS.map((f) => f + '=?').join(',')},
      sync_status = CASE WHEN woo_id IS NOT NULL THEN 'out_of_date' ELSE 'not_synced' END,
      updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...v, req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'Not found' });
    res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id));
  } catch (e) {
    res.status(e.message.includes('UNIQUE') ? 409 : 500).json({ error: e.message });
  }
});

r.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default r;