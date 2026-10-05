import { useEffect, useState } from 'react';
import { api } from '../api';
import SyncBadge from '../components/SyncBadge';
import ProductForm from '../components/ProductForm';

export default function Products({ notify }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, product = edit
  const [busyId, setBusyId] = useState(null);

  const load = () =>
    api.products(search, category).then(setProducts).catch((e) => notify(e.message, true));

  useEffect(() => { load(); }, [search, category]);
  useEffect(() => { api.categories().then(setCategories); }, []);

  const save = async (data) => {
    try {
      if (data.id) await api.updateProduct(data.id, data);
      else await api.createProduct(data);
      setEditing(null);
      notify('Product saved');
      load();
    } catch (e) { notify(e.message, true); }
  };

  const remove = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await api.deleteProduct(p.id);
    notify('Product deleted');
    load();
  };

  const sync = async (p) => {
    setBusyId(p.id);
    try {
      await api.syncOne(p.id);
      notify(`"${p.name}" synced to WooCommerce`);
    } catch (e) { notify(e.message, true); }
    setBusyId(null);
    load();
  };

  return (
    <>
      <div className="page-head">
        <h1>Products</h1>
        <button className="btn" onClick={() => setEditing({})}>+ Product</button>
      </div>

      <div className="toolbar">
        <input placeholder="Search name, SKU, brand…" value={search}
               onChange={(e) => setSearch(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <table>
        <thead>
          <tr><th>Name</th><th>SKU</th><th>Category</th><th>Brand</th>
              <th>Price</th><th>Stock</th><th>Sync</th><th></th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td><strong>{p.name}</strong><div className="muted">
                {[p.color, p.size, p.material].filter(Boolean).join(' · ')}</div></td>
              <td>{p.sku}</td>
              <td>{p.category_name || '—'}</td>
              <td>{p.brand || '—'}</td>
              <td>₹{p.price.toLocaleString('en-IN')}</td>
              <td>{p.stock}</td>
              <td><SyncBadge status={p.sync_status} /></td>
              <td className="row-actions">
                <button className="btn small" disabled={busyId === p.id || p.sync_status === 'synced'}
                        onClick={() => sync(p)}>
                  {busyId === p.id ? 'Syncing…' : 'Sync'}
                </button>
                <button className="btn small ghost" onClick={() => setEditing(p)}>Edit</button>
                <button className="btn small danger" onClick={() => remove(p)}>Delete</button>
              </td>
            </tr>
          ))}
          {!products.length && <tr><td colSpan="8" className="empty">No products found</td></tr>}
        </tbody>
      </table>

      {editing && (
        <ProductForm product={editing} categories={categories}
                     onSave={save} onClose={() => setEditing(null)} />
      )}
    </>
  );
}