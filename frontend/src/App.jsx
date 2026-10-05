import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sync from './pages/Sync';

const NAV = [['dashboard', 'Dashboard'], ['products', 'Products'], ['sync', 'Sync']];

export default function App() {
  const [view, setView] = useState('products');
  const [toast, setToast] = useState(null);

  const notify = (msg, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 2800);
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">PIM</div>
        {NAV.map(([key, label]) => (
          <button key={key} className={view === key ? 'nav active' : 'nav'}
                  onClick={() => setView(key)}>{label}</button>
        ))}
      </aside>
      <main>
        {view === 'dashboard' && <Dashboard />}
        {view === 'products' && <Products notify={notify} />}
        {view === 'sync' && <Sync notify={notify} />}
      </main>
      {toast && <div className={toast.error ? 'toast error' : 'toast'}>{toast.msg}</div>}
    </div>
  );
}