import express from 'express';
import cors from 'cors';
import './db.js';
import products from './routes/products.js';
import categories from './routes/categories.js';
import sync from './routes/sync.js';
import mockWoo from './routes/mockWoo.js';
import { db } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/products', products);
app.use('/api/categories', categories);
app.use('/api/sync', sync);
app.use('/mock-woo', mockWoo);

app.get('/api/stats', (_req, res) => {
  const count = (where = '1=1') => db.prepare(`SELECT COUNT(*) AS n FROM products WHERE ${where}`).get().n;
  res.json({
    total: count(),
    synced: count(`sync_status='synced'`),
    not_synced: count(`sync_status='not_synced'`),
    out_of_date: count(`sync_status='out_of_date'`),
    error: count(`sync_status='error'`),
  });
});

app.get('/', (_req, res) => res.json({
  service: 'PIM backend',
  endpoints: ['/api/products', '/api/categories', '/api/stats', '/api/sync', '/mock-woo/wp-json/wc/v3/products'],
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`PIM backend on http://localhost:${PORT}`));