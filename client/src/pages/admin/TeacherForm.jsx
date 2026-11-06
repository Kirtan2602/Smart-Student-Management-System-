import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useLookups from '../../hooks/useLookups';
import useToast from '../../hooks/useToast';
import { createTeacher, fetchTeacher, updateTeacher } from '../../services/teacherService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import { getErrorMessage } from '../../utils/errors';

export default function TeacherForm() {
  const { id } = useParams();
  const lookups = useLookups();

  const fetcher = useCallback(() => (id ? fetchTeacher(id) : Promise.resolve(null)), [id]);
  const { data: teacher, loading, error, reload } = useFetch(fetcher);

  if (loading || lookups.loading) return <Loader />;
  if (error || lookups.error) {
    return <ErrorMessage message={error || lookups.error} onRetry={reload} />;
  }

  return <TeacherFormInner key={id || 'new'} teacher={teacher} lookups={lookups} />;
}

function TeacherFormInner({ teacher, lookups }) {
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(teacher);

  const [form, setForm] = useState({
    email: teacher?.user.email || '',
    password: '',
    employeeCode: teacher?.employeeCode || '',
    firstName: teacher?.firstName || '',
    lastName: teacher?.lastName || '',
    phone: teacher?.phone || '',
    designation: teacher?.designation || '',
    departmentId: teacher ? String(teacher.departmentId) : '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      email: form.email.trim(),
      employeeCode: form.employeeCode.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim() || null,
      designation: form.designation.trim() || null,
      departmentId: Number(form.departmentId),
    };
    if (!isEdit) payload.password = form.password;

    try {
      if (isEdit) {
        await updateTeacher(teacher.id, payload);
        toast.success('Teacher updated successfully');
        navigate(`/admin/teachers/${teacher.id}`);
      } else {
        const created = await createTeacher(payload);
        toast.success('Teacher added successfully');
        navigate(`/admin/teachers/${created.id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  const departmentOptions = lookups.departments.filter(
    (d) => d.isActive || String(d.id) === form.departmentId
  );

  return (
    <>
      <PageHeader title={isEdit ? 'Edit Teacher' : 'Add Teacher'} subtitle="Fields marked * are required" />

      <div className="card">
        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-circle me-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label">Email *</label>
                <input type="email" className="form-control" value={form.email} onChange={setField('email')} required />
              </div>
              {!isEdit && (
                <div className="col-md-6">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={setField('password')}
                    autoComplete="new-password"
                    required
                  />
                  <div className="form-text">Min 8 characters, with uppercase, lowercase and a number.</div>
                </div>
              )}
              <div className="col-md-4">
                <label className="form-label">Employee Code *</label>
                <input className="form-control" value={form.employeeCode} onChange={setField('employeeCode')} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">First Name *</label>
                <input className="form-control" value={form.firstName} onChange={setField('firstName')} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Last Name *</label>
                <input className="form-control" value={form.lastName} onChange={setField('lastName')} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={setField('phone')} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Designation</label>
                <input
                  className="form-control"
                  placeholder="Lecturer, HOD..."
                  value={form.designation}
                  onChange={setField('designation')}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Department *</label>
                <select className="form-select" value={form.departmentId} onChange={setField('departmentId')} required>
                  <option value="">Select</option>
                  {departmentOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : isEdit ? 'Update Teacher' : 'Add Teacher'}
              </button>
              <Link to={isEdit ? `/admin/teachers/${teacher.id}` : '/admin/teachers'} className="btn btn-outline-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}