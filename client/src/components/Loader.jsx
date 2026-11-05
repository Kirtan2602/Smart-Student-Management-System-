export default function Loader({ fullPage = false, text = 'Loading...' }) {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center text-muted ${
        fullPage ? 'vh-100' : 'py-5'
      }`}
    >
      <div className="spinner-border text-primary" role="status" />
      <div className="mt-2 small">{text}</div>
    </div>
  );
}