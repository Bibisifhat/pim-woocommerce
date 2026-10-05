async function req(path, options) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  products: (search = '', category = '') =>
    req(`/api/products?search=${encodeURIComponent(search)}&category=${category}`),
  createProduct: (b) => req('/api/products', { method: 'POST', body: JSON.stringify(b) }),
  updateProduct: (id, b) => req(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
  deleteProduct: (id) => req(`/api/products/${id}`, { method: 'DELETE' }),
  categories: () => req('/api/categories'),
  stats: () => req('/api/stats'),
  syncOne: (id) => req(`/api/sync/${id}`, { method: 'POST' }),
  syncAll: () => req('/api/sync', { method: 'POST' }),
  wooProducts: () => req('/mock-woo/wp-json/wc/v3/products'),
};