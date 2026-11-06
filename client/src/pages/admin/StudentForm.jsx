import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useLookups from '../../hooks/useLookups';
import useToast from '../../hooks/useToast';
import { createStudent, fetchStudent, updateStudent } from '../../services/studentService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import { getErrorMessage } from '../../utils/errors';
import { toDateInput } from '../../utils/format';

// Bahar no component: data load kare. Andar no component: form.
export default function StudentForm() {
  const { id } = useParams();
  const lookups = useLookups();

  const fetcher = useCallback(() => (id ? fetchStudent(id) : Promise.resolve(null)), [id]);
  const { data: student, loading, error, reload } = useFetch(fetcher);

  if (loading || lookups.loading) return <Loader />;
  if (error || lookups.error) {
    return <ErrorMessage message={error || lookups.error} onRetry={reload} />;
  }

  return <StudentFormInner key={id || 'new'} student={student} lookups={lookups} />;
}

function StudentFormInner({ student, lookups }) {
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(student);
  const currentYear = lookups.academicYears.find((y) => y.isCurrent);

  const [form, setForm] = useState({
    email: student?.user.email || '',
    password: '',
    enrollmentNo: student?.enrollmentNo || '',
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    phone: student?.phone || '',
    gender: student?.gender || '',
    dateOfBirth: toDateInput(student?.dateOfBirth),
    address: student?.address || '',
    departmentId: student ? String(student.departmentId) : '',
    semesterId: student ? String(student.semesterId) : '',
    academicYearId: student ? String(student.academicYearId) : currentYear ? String(currentYear.id) : '',
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
      enrollmentNo: form.enrollmentNo.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim() || null,
      gender: form.gender || null,
      dateOfBirth: form.dateOfBirth || null,
      address: form.address.trim() || null,
      departmentId: Number(form.departmentId),
      semesterId: Number(form.semesterId),
      academicYearId: Number(form.academicYearId),
    };
    if (!isEdit) payload.password = form.password;

    try {
      if (isEdit) {
        await updateStudent(student.id, payload);
        toast.success('Student updated successfully');
        navigate(`/admin/students/${student.id}`);
      } else {
        const created = await createStudent(payload);
        toast.success('Student added successfully');
        navigate(`/admin/students/${created.id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  // Inactive department fakt tyare j dekhao jyare student ni pase te hoy
  const departmentOptions = lookups.departments.filter(
    (d) => d.isActive || String(d.id) === form.departmentId
  );

  return (
    <>
      <PageHeader title={isEdit ? 'Edit Student' : 'Add Student'} subtitle="Fields marked * are required" />

      <div className="card">
        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-circle me-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <h6 className="text-primary mb-3">Login Details</h6>
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
            </div>

            <h6 className="text-primary mb-3">Personal Details</h6>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label">Enrollment No *</label>
                <input className="form-control" value={form.enrollmentNo} onChange={setField('enrollmentNo')} required />
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
                <label className="form-label">Gender</label>
                <select className="form-select" value={form.gender} onChange={setField('gender')}>
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-control" value={form.dateOfBirth} onChange={setField('dateOfBirth')} />
              </div>
              <div className="col-12">
                <label className="form-label">Address</label>
                <textarea className="form-control" rows="2" value={form.address} onChange={setField('address')} />
              </div>
            </div>

            <h6 className="text-primary mb-3">Academic Details</h6>
            <div className="row g-3 mb-4">
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
              <div className="col-md-4">
                <label className="form-label">Semester *</label>
                <select className="form-select" value={form.semesterId} onChange={setField('semesterId')} required>
                  <option value="">Select</option>
                  {lookups.semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Academic Year *</label>
                <select className="form-select" value={form.academicYearId} onChange={setField('academicYearId')} required>
                  <option value="">Select</option>
                  {lookups.academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                      {y.isCurrent ? ' (current)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!isEdit && (
              <div className="alert alert-info py-2">
                <i className="bi bi-info-circle me-2" />
                Student will be automatically enrolled in all active subjects of the selected department and semester.
              </div>
            )}

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : isEdit ? 'Update Student' : 'Add Student'}
              </button>
              <Link to={isEdit ? `/admin/students/${student.id}` : '/admin/students'} className="btn btn-outline-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}