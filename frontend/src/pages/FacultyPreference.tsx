import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { studentMenu } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { api } from '../api';
import type { Elective, FacultyMember } from '../types';

export default function FacultyPreferencePage() {
  const [elective1, setElective1] = useState<Elective | null>(null);
  const [elective2, setElective2] = useState<Elective | null>(null);
  const [faculty1, setFaculty1] = useState<FacultyMember[]>([]);
  const [faculty2, setFaculty2] = useState<FacultyMember[]>([]);
  const [prefs1, setPrefs1] = useState<(string | null)[]>([null, null, null]);
  const [prefs2, setPrefs2] = useState<(string | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getPendingRegistration()
      .then(async (pending) => {
        setElective1(pending.elective_1);
        setElective2(pending.elective_2);
        const [f1, f2] = await Promise.all([
          api.getElectiveFaculty(pending.elective_1.elective_id),
          api.getElectiveFaculty(pending.elective_2.elective_id),
        ]);
        setFaculty1(f1);
        setFaculty2(f2);
      })
      .catch((e) => {
        setError(e.message);
        setTimeout(() => navigate('/student/register'), 2000);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handlePrefChange = (
    slot: 1 | 2,
    index: number,
    value: string
  ) => {
    const setter = slot === 1 ? setPrefs1 : setPrefs2;
    setter((prev) => {
      const next = [...prev];
      next[index] = value || null;
      return next;
    });
  };

  const getAvailableFaculty = (faculty: FacultyMember[], prefs: (string | null)[], currentIndex: number) => {
    const used = prefs.filter((_, i) => i !== currentIndex).filter(Boolean);
    return faculty.filter((f) => !used.includes(f.faculty_id));
  };

  const handleSubmit = async () => {
    const p1 = prefs1.filter(Boolean) as string[];
    const p2 = prefs2.filter(Boolean) as string[];

    if (p1.length === 0 || p2.length === 0) {
      setError('Please select at least Preference 1 for each elective');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.submitRegistration(p1, p2);
      navigate('/student/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar roleLabel="Student" menuItems={studentMenu} />

      <main className="flex-1 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Faculty Preference</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Rank up to 3 faculty preferences for each elective
            </p>
          </div>
          <ThemeToggle />
        </div>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'color-mix(in srgb, var(--danger) 10%, transparent)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        {!loading && elective1 && elective2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <PreferenceCard
              label="Elective 1"
              elective={elective1}
              faculty={faculty1}
              prefs={prefs1}
              onChange={(i, v) => handlePrefChange(1, i, v)}
              getAvailable={(i) => getAvailableFaculty(faculty1, prefs1, i)}
            />
            <PreferenceCard
              label="Elective 2"
              elective={elective2}
              faculty={faculty2}
              prefs={prefs2}
              onChange={(i, v) => handlePrefChange(2, i, v)}
              getAvailable={(i) => getAvailableFaculty(faculty2, prefs2, i)}
            />
          </div>
        )}

        {!loading && elective1 && (
          <div className="mt-6">
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function PreferenceCard({
  label,
  elective,
  faculty,
  prefs,
  onChange,
  getAvailable,
}: {
  label: string;
  elective: Elective;
  faculty: FacultyMember[];
  prefs: (string | null)[];
  onChange: (index: number, value: string) => void;
  getAvailable: (index: number) => FacultyMember[];
}) {
  const prefLabels = ['Preference 1', 'Preference 2', 'Preference 3'];

  return (
    <div className="card p-5">
      <div className="mb-4">
        <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <h2 className="font-semibold text-lg">{elective.elective_name}</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{elective.branch_name}</p>
      </div>

      {faculty.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No faculty assigned to this elective.</p>
      ) : (
        <div className="space-y-3">
          {prefLabels.map((prefLabel, i) => (
            <div key={prefLabel}>
              <label className="block text-sm font-medium mb-1.5">
                {prefLabel} {i === 0 && <span style={{ color: 'var(--danger)' }}>*</span>}
              </label>
              <select
                className="input-field"
                value={prefs[i] || ''}
                onChange={(e) => onChange(i, e.target.value)}
              >
                <option value="">{i === 0 ? 'Select faculty' : 'Optional'}</option>
                {getAvailable(i).map((f) => (
                  <option key={f.faculty_id} value={f.faculty_id}>
                    {f.faculty_name} ({f.faculty_id})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
