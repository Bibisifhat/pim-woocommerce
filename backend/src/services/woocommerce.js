const REAL = Boolean(process.env.WOO_URL);
const BASE = process.env.WOO_URL || 'http://localhost:5000/mock-woo';
const KEY = process.env.WOO_KEY || 'ck_demo';
const SECRET = process.env.WOO_SECRET || 'cs_demo';

async function woo(path, method = 'GET', body) {
  const url = new URL(`${BASE}/wp-json/wc/v3${path}`);
  const headers = { 'Content-Type': 'application/json' };
  if (BASE.startsWith('https')) {
    headers.Authorization = 'Basic ' + Buffer.from(`${KEY}:${SECRET}`).toString('base64');
  } else {
    url.searchParams.set('consumer_key', KEY);       // Woo requires this over plain HTTP
    url.searchParams.set('consumer_secret', SECRET);
  }
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `WooCommerce responded ${res.status}`);
    err.code = data.code;
    throw err;
  }
  return data;
}

// Real Woo needs category IDs, so look up the category, or create it
async function categoryId(name) {
  const found = await woo(`/products/categories?search=${encodeURIComponent(name)}`);
  const exact = found.find((c) => c.name.toLowerCase() === name.toLowerCase());
  return (exact || (await woo('/products/categories', 'POST', { name }))).id;
}

async function toWooPayload(p) {
  const attr = (name, value) => (value ? [{ name, visible: true, options: [String(value)] }] : []);
  let categories = [];
  if (p.category_name) {
    categories = REAL ? [{ id: await categoryId(p.category_name) }] : [{ name: p.category_name }];
  }
  return {
    name: p.name, sku: p.sku, type: 'simple',
    regular_price: String(p.price),
    description: p.description || '',
    manage_stock: true, stock_quantity: p.stock,
    categories,
    attributes: [...attr('Brand', p.brand), ...attr('Color', p.color),
                 ...attr('Size', p.size), ...attr('Material', p.material)],
  };
}

export async function pushProduct(p) {
  const payload = await toWooPayload(p);
  if (p.woo_id) return (await woo(`/products/${p.woo_id}`, 'PUT', payload)).id;
  try {
    return (await woo('/products', 'POST', payload)).id;
  } catch (e) {
    // SKU already exists in the store: adopt that product and update it instead
    if (e.code === 'product_invalid_sku' || e.code === 'woocommerce_rest_product_sku_already_exists') {
      const [existing] = await woo(`/products?sku=${encodeURIComponent(p.sku)}`);
      if (existing) return (await woo(`/products/${existing.id}`, 'PUT', payload)).id;
    }
    throw e;
  }
}