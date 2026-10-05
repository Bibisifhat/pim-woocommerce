import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

fs.mkdirSync('data', { recursive: true });
export const db = new DatabaseSync('data/pim.db');

db.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  stock INTEGER DEFAULT 0,
  brand TEXT, color TEXT, size TEXT, material TEXT,
  category_id INTEGER REFERENCES categories(id),
  woo_id INTEGER,
  sync_status TEXT DEFAULT 'not_synced',
  last_synced_at TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

// Seed demo data on first run
if (db.prepare('SELECT COUNT(*) AS n FROM categories').get().n === 0) {
  const addCat = db.prepare('INSERT INTO categories (name) VALUES (?)');
  ['Shoes', 'Clothing', 'Electronics', 'Accessories'].forEach((c) => addCat.run(c));

  const add = db.prepare(`INSERT INTO products
    (sku,name,description,price,stock,brand,color,size,material,category_id)
    VALUES (?,?,?,?,?,?,?,?,?,?)`);
  add.run('NIKE001', 'Nike Air Max', 'Cushioned everyday sneaker', 8999, 25, 'Nike', 'Black', '9', 'Mesh', 1);
  add.run('ADI001', 'Adidas Runner', 'Lightweight running shoe', 6999, 40, 'Adidas', 'White', '8', 'Knit', 1);
  add.run('PUMA001', 'Puma Flex', 'Flexible training shoe', 4999, 15, 'Puma', 'Red', '10', 'Synthetic', 1);
  add.run('TEE001', 'Cotton T-Shirt', 'Classic crew neck tee', 799, 100, 'Uniqlo', 'Blue', 'M', 'Cotton', 2);
  add.run('LAP001', 'ProBook 14', '14-inch work laptop', 54999, 8, 'HP', 'Silver', null, 'Aluminium', 3);
  add.run('WAT001', 'Steel Watch', 'Minimal analog watch', 2499, 30, 'Fossil', 'Grey', null, 'Steel', 4);
}