import { Router } from 'express';
import { db } from '../db.js';
import { pushProduct } from '../services/woocommerce.js';

const r = Router();
const getFull = (id) => db.prepare(`SELECT p.*, c.name AS category_name FROM products p
  LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?`).get(id);

async function syncOne(id) {
  const p = getFull(id);
  if (!p) throw new Error('Product not found');
  try {
    const wooId = await pushProduct(p);
    db.prepare(`UPDATE products SET woo_id=?, sync_status='synced', last_synced_at=CURRENT_TIMESTAMP WHERE id=?`).run(wooId, id);
  } catch (e) {
    db.prepare(`UPDATE products SET sync_status='error' WHERE id=?`).run(id);
    throw e;
  }
  return getFull(id);
}

r.post('/', async (_req, res) => {            // sync all pending
  const pending = db.prepare(`SELECT id FROM products WHERE sync_status != 'synced'`).all();
  const results = { synced: 0, failed: 0 };
  for (const { id } of pending) {
    try { await syncOne(id); results.synced++; } catch { results.failed++; }
  }
  res.json(results);
});

r.post('/:id', async (req, res) => {          // sync one
  try { res.json(await syncOne(Number(req.params.id))); }
  catch (e) { res.status(502).json({ error: e.message }); }
});

export default r;