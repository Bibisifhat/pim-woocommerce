import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api.stats().then(setS); }, []);
  if (!s) return <p>Loading…</p>;

  const cards = [
    ['Total products', s.total, ''],
    ['Synced', s.synced, 'green'],
    ['Not synced', s.not_synced, 'amber'],
    ['Out of date', s.out_of_date, 'blue'],
  ];

  return (
    <>
      <h1>Dashboard</h1>
      <div className="cards">
        {cards.map(([label, n, color]) => (
          <div key={label} className={`card ${color}`}>
            <div className="num">{n}</div>
            <div className="muted">{label}</div>
          </div>
        ))}
      </div>
    </>
  );
}