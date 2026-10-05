import { useState } from 'react';

const TEXT = [
  ['name', 'Name'], ['sku', 'SKU'], ['brand', 'Brand'],
  ['color', 'Color'], ['size', 'Size'], ['material', 'Material'],
];

export default function ProductForm({ product, categories, onSave, onClose }) {
  const [f, setF] = useState({
    name: '', sku: '', description: '', price: '', stock: 0,
    brand: '', color: '', size: '', material: '', category_id: '',
    ...product,
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...f,
      price: Number(f.price),
      stock: Number(f.stock) || 0,
      category_id: f.category_id ? Number(f.category_id) : null,
    });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{product?.id ? 'Edit product' : 'New product'}</h2>
        <div className="grid">
          {TEXT.map(([k, label]) => (
            <label key={k}>{label}
              <input value={f[k] ?? ''} onChange={set(k)} required={k === 'name' || k === 'sku'} />
            </label>
          ))}
          <label>Price (₹)
            <input type="number" step="0.01" min="0" value={f.price} onChange={set('price')} required />
          </label>
          <label>Stock
            <input type="number" min="0" value={f.stock} onChange={set('stock')} />
          </label>
          <label>Category
            <select value={f.category_id ?? ''} onChange={set('category_id')}>
              <option value="">— none —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>
        <label>Description
          <textarea rows="3" value={f.description ?? ''} onChange={set('description')} />
        </label>
        <div className="actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn">Save</button>
        </div>
      </form>
    </div>
  );
}