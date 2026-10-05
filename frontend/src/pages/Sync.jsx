import { useEffect, useState } from 'react';
import { api } from '../api';
import SyncBadge from '../components/SyncBadge';

export default function Sync({ notify }) {
  const [pending, setPending] = useState([]);
  const [woo, setWoo] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const all = await api.products();
    setPending(all.filter((p) => p.sync_status !== 'synced'));
    setWoo(await api.wooProducts());
  };
  useEffect(() => { load(); }, []);

  const syncAll = async () => {
    setBusy(true);
    try {
      const r = await api.syncAll();
      notify(`Synced ${r.synced} product(s)${r.failed ? `, ${r.failed} failed` : ''}`, r.failed > 0);
    } catch (e) { notify(e.message, true); }
    setBusy(false);
    load();
  };

  return (
    <>
      <div className="page-head">
        <h1>WooCommerce Sync</h1>
        <button className="btn" disabled={busy || !pending.length} onClick={syncAll}>
          {busy ? 'Syncing…' : `Sync all (${pending.length})`}
        </button>
      </div>

      <div className="two-col">
        <section>
          <h3>Waiting to sync (PIM)</h3>
          {pending.length === 0 && <p className="muted">Everything is up to date ✓</p>}
          {pending.map((p) => (
            <div key={p.id} className="list-row">
              <span>{p.name}</span><SyncBadge status={p.sync_status} />
            </div>
          ))}
        </section>

        <section>
          <h3>Mock WooCommerce store</h3>
          <p className="muted">What the store received via <code>/wp-json/wc/v3/products</code></p>
          {woo.length === 0 && <p className="muted">Store is empty</p>}
          {woo.map((w) => (
            <div key={w.id} className="list-row">
              <span>#{w.id} {w.name}</span><span className="muted">₹{w.regular_price}</span>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
