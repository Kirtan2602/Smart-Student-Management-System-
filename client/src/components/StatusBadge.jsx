export default function StatusBadge({ active }) {
  return (
    <span className={`badge ${active ? 'text-bg-success' : 'text-bg-secondary'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}