import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import { changePassword, fetchProfile, updateProfile } from '../../services/profileService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { ROLE_LABEL } from '../../utils/roles';
import { getErrorMessage } from '../../utils/errors';
import { formatDate } from '../../utils/format';

function Info({ label, value }) {
  return (
    <div className="col-sm-6">
      <div className="text-muted small">{label}</div>
      <div className="fw-semibold">{value || '-'}</div>
    </div>
  );
}

function ProfileDetails({ profile, onSaved }) {
  const toast = useToast();
  const { refreshUser } = useAuth();
  const details = profile.student || profile.teacher; // admin ma null
  const isStudent = Boolean(profile.student);

  const [form, setForm] = useState({
    firstName: details?.firstName || '',
    lastName: details?.lastName || '',
    phone: details?.phone || '',
    address: profile.student?.address || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || null,
      };
      if (isStudent) payload.address = form.address.trim() || null;

      await updateProfile(payload);
      await refreshUser(); // navbar ma navu naam
      toast.success('Profile updated successfully');
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header bg-white fw-semibold d-flex justify-content-between">
        Account Details <StatusBadge active={profile.isActive} />
      </div>
      <div className="card-body">
        <div className="row g-3 mb-3">
          <Info label="Email (login)" value={profile.email} />
          <Info label="Role" value={ROLE_LABEL[profile.role]} />
          {profile.student && (
            <>
              <Info label="Enrollment No" value={profile.student.enrollmentNo} />
              <Info label="Department" value={profile.student.department.name} />
              <Info label="Semester" value={profile.student.semester.name} />
              <Info label="Academic Year" value={profile.student.academicYear.name} />
              <Info label="Gender" value={profile.student.gender} />
              <Info
                label="Date of Birth"
                value={profile.student.dateOfBirth ? formatDate(profile.student.dateOfBirth) : null}
              />
            </>
          )}
          {profile.teacher && (
            <>
              <Info label="Employee Code" value={profile.teacher.employeeCode} />
              <Info label="Department" value={profile.teacher.department.name} />
              <Info label="Designation" value={profile.teacher.designation} />
            </>
          )}
        </div>

        {!details ? (
          <div className="alert alert-info mb-0">
            <i className="bi bi-info-circle me-2" />
            The administrator account has no personal details. You can change your password.
          </div>
        ) : (
          <>
            <hr />
            <h6 className="text-primary mb-3">Edit Contact Details</h6>
            {error && (
              <div className="alert alert-danger py-2">
                <i className="bi bi-exclamation-circle me-2" />
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">First Name *</label>
                  <input className="form-control" value={form.firstName} onChange={setField('firstName')} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Last Name *</label>
                  <input className="form-control" value={form.lastName} onChange={setField('lastName')} required />
                </div>
                <div className="col-12">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={form.phone} onChange={setField('phone')} />
                </div>
                {isStudent && (
                  <div className="col-12">
                    <label className="form-label">Address</label>
                    <textarea className="form-control" rows="2" value={form.address} onChange={setField('address')} />
                  </div>
                )}
              </div>
              <div className="form-text mt-2">
                Email, enrollment number and department can be changed only by the administrator.
              </div>
              <button type="submit" className="btn btn-primary mt-3" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function ChangePasswordCard() {
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    setSaving(true);
    try {
      const res = await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success(res.message);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header bg-white fw-semibold">Change Password</div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger py-2">
            <i className="bi bi-exclamation-circle me-2" />
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Current Password *</label>
            <input
              type="password"
              className="form-control"
              value={form.currentPassword}
              onChange={setField('currentPassword')}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">New Password *</label>
            <input
              type="password"
              className="form-control"
              value={form.newPassword}
              onChange={setField('newPassword')}
              autoComplete="new-password"
              required
            />
            <div className="form-text">Min 8 characters, with uppercase, lowercase and a number.</div>
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm New Password *</label>
            <input
              type="password"
              className="form-control"
              value={form.confirmPassword}
              onChange={setField('confirmPassword')}
              autoComplete="new-password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Changing...' : 'Change Password'}
          </button>
          <div className="form-text mt-2">
            After changing the password, you will stay logged in here, but your other devices will be logged out.
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Profile() {
  const { data, loading, error, reload } = useFetch(fetchProfile);

  if (error) return <ErrorMessage message={error} onRetry={reload} />;
  if (loading || !data) return <Loader />;

  return (
    <>
      <PageHeader title="My Profile" subtitle="Manage your account" />
      <div className="row g-3">
        <div className="col-12 col-xl-7">
          <ProfileDetails profile={data} onSaved={reload} />
        </div>
        <div className="col-12 col-xl-5">
          <ChangePasswordCard />
        </div>
      </div>
    </>
  );
}