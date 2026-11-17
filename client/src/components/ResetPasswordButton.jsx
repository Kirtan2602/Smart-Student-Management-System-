import { useState } from 'react';
import useToast from '../hooks/useToast';
import { resetUserPassword } from '../services/profileService';
import FormModal from './FormModal';
import { getErrorMessage } from '../utils/errors';

// Admin: student/teacher no password reset
export default function ResetPasswordButton({ userId, name }) {
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const close = () => {
    setShow(false);
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await resetUserPassword(userId, password);
      toast.success(`Password reset for ${name}`);
      close();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button className="btn btn-outline-warning" onClick={() => setShow(true)}>
        <i className="bi bi-key me-1" />
        Reset Password
      </button>

      {show && (
        <FormModal
          title={`Reset password: ${name}`}
          onClose={close}
          onSubmit={handleSubmit}
          submitting={saving}
          error={error}
          submitText="Reset Password"
        >
          <label className="form-label">New Password *</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <div className="form-text">
            Min 8 characters, with uppercase, lowercase and a number. The user will be logged out from all devices.
          </div>
        </FormModal>
      )}
    </>
  );
}