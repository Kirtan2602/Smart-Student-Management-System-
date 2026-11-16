import { useState } from 'react';
import useToast from '../hooks/useToast';
import { getErrorMessage } from '../utils/errors';

// onDownload(format) -> Promise. Busy state ane error toast aa component sambhale chhe
export default function ExportButtons({ onDownload, disabled = false }) {
  const toast = useToast();
  const [busy, setBusy] = useState('');

  const run = async (format) => {
    setBusy(format);
    try {
      await onDownload(format);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="btn-group">
      <button className="btn btn-outline-danger" disabled={disabled || Boolean(busy)} onClick={() => run('pdf')}>
        <i className="bi bi-file-earmark-pdf me-1" />
        {busy === 'pdf' ? 'Preparing...' : 'PDF'}
      </button>
      <button className="btn btn-outline-success" disabled={disabled || Boolean(busy)} onClick={() => run('csv')}>
        <i className="bi bi-file-earmark-spreadsheet me-1" />
        {busy === 'csv' ? 'Preparing...' : 'CSV'}
      </button>
    </div>
  );
}