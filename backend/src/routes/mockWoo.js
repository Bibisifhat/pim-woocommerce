import { Router } from 'express';

const r = Router();
const store = new Map();
let nextId = 100;

r.get('/wp-json/wc/v3/products', (_req, res) => res.json([...store.values()]));

r.post('/wp-json/wc/v3/products', (req, res) => {
  const id = nextId++;
  const prod = { id, ...req.body, date_created: new Date().toISOString() };
  store.set(id, prod);
  res.status(201).json(prod);
});

// Upsert, so it survives a server restart (mock store is in-memory)
r.put('/wp-json/wc/v3/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const prod = { ...(store.get(id) || {}), id, ...req.body, date_modified: new Date().toISOString() };
  store.set(id, prod);
  res.json(prod);
});

export default r;