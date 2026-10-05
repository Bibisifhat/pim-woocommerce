const MAP = {
  synced: ['✓ Synced', 'green'],
  not_synced: ['⚠ Not synced', 'amber'],
  out_of_date: ['↻ Out of date', 'blue'],
  error: ['✕ Error', 'red'],
};

export default function SyncBadge({ status }) {
  const [label, color] = MAP[status] || MAP.not_synced;
  return <span className={`badge ${color}`}>{label}</span>;
}