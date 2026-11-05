export default function EmptyState({ icon = 'bi-inbox', message }) {
  return (
    <div className="text-center text-muted py-4">
      <i className={`bi ${icon} fs-1 d-block mb-2`} />
      <div>{message}</div>
    </div>
  );
}