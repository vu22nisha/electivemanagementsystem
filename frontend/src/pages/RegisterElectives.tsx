import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Sidebar, { studentMenu } from '../components/Sidebar';
import { api } from '../api';
import type { BranchElectivesGroup } from '../types';

type DepartmentFilter = 'all' | 'cse' | 'aiml' | 'ece' | 'eee' | 'other';

type Slot = 1 | 2;

export default function RegisterElectivesPage() {
  const [groups, setGroups] = useState<BranchElectivesGroup[]>([]);
  const [selectedElectives, setSelectedElectives] = useState<Record<Slot, number | null>>({ 1: null, 2: null });
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const focusId = Number(searchParams.get('focus'));
    if (focusId > 0) {
      setSelectedElectives((prev) => ({ ...prev, 1: focusId }));
    }

    api.getStudentDashboard().then((dash) => {
      if (dash.registration_status === 'Registered') {
        navigate('/student/dashboard');
      }
    });
    api.getAvailableElectives()
      .then(setGroups)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [navigate, searchParams]);

  const selectedIds = [selectedElectives[1], selectedElectives[2]].filter((id): id is number => id !== null);
  const canProceed = selectedIds.length === 2 && new Set(selectedIds).size === 2;

  const filteredGroups = groups.filter((group) => {
    if (departmentFilter === 'all') return true;
    if (departmentFilter === 'other') {
      return !['cse', 'aiml', 'ece', 'eee'].some((dept) => group.branch_name.toLowerCase().includes(dept));
    }
    const branch = group.branch_name.toLowerCase();
    return branch.includes(departmentFilter);
  });

  const handleSelectElective = (slot: Slot, electiveId: number) => {
    setSelectedElectives((prev) => ({ ...prev, [slot]: electiveId }));
  };

  const toggleOtherDept = () => {
    setDepartmentFilter((prev) => (prev === 'other' ? 'all' : 'other'));
  };

  const selectedCourse = (slot: Slot) =>
    groups
      .flatMap((group) => group.electives)
      .find((elective) => elective.elective_id === selectedElectives[slot]);

  const handleContinue = async () => {
    if (!canProceed) return;

    setSubmitting(true);
    setError('');
    try {
      const [id1, id2] = selectedIds;
      const check = await api.checkPrerequisites(id1, id2);
      if (!check.all_passed) {
        setError('Please choose a different combination of electives for this semester.');
        return;
      }
      await api.selectElectives(id1, id2);
      navigate('/student/faculty-preference');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar roleLabel="Student" menuItems={studentMenu} />

      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="hero-banner card p-6 lg:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm" style={{ borderColor: 'color-mix(in srgb, var(--accent) 18%, var(--border-color))', background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}>
                  <Sparkles size={16} />
                  Elective registration
                </div>
                <h1 className="mt-4 text-3xl font-semibold">Semester 5 elective registration</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                  Choose one course for each elective slot, then continue to faculty preference. Sections A to L have 65 students each.
                </p>
              </div>
            </div>
          </div>

          {loading && <div className="card p-6 text-sm" style={{ color: 'var(--text-secondary)' }}>Loading electives...</div>}
          {error && (
            <div className="card p-4 text-sm" style={{ color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6 animate-fade-in">
            <section className="card p-6">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Sparkles size={18} />
                Elective 1
              </div>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border p-4">
                  <p className="text-sm font-medium">Current selection</p>
                  <p className="mt-3 text-lg font-semibold">{selectedCourse(1)?.elective_name ?? 'Choose from the elective'}</p>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {selectedCourse(1)?.branch_name ?? 'Select a course for slot 1.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {filteredGroups.flatMap((group) => group.electives).map((elective) => {
                    const isSelected = selectedElectives[1] === elective.elective_id;
                    const isUsedElsewhere = selectedElectives[2] === elective.elective_id;
                    return (
                      <button
                        key={elective.elective_id}
                        type="button"
                        onClick={() => handleSelectElective(1, elective.elective_id)}
                        className={`elective-radio w-full text-left ${isSelected ? 'selected' : ''}`}
                        disabled={isUsedElsewhere && !isSelected}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{elective.elective_name}</p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{elective.branch_name}</p>
                          </div>
                          <span className={`badge ${isSelected ? 'badge-success' : 'badge-info'}`}>
                            {isSelected ? 'Selected' : isUsedElsewhere ? 'Taken' : 'Choose'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button type="button" className="btn-secondary w-full" onClick={toggleOtherDept}>
                  Other dept
                </button>
              </div>
            </section>

            <section className="card p-6">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Sparkles size={18} />
                Elective 2
              </div>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border p-4">
                  <p className="text-sm font-medium">Current selection</p>
                  <p className="mt-3 text-lg font-semibold">{selectedCourse(2)?.elective_name ?? 'Choose from the elective'}</p>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {selectedCourse(2)?.branch_name ?? 'Select a course for slot 2.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {filteredGroups.flatMap((group) => group.electives).map((elective) => {
                    const isSelected = selectedElectives[2] === elective.elective_id;
                    const isUsedElsewhere = selectedElectives[1] === elective.elective_id;
                    return (
                      <button
                        key={elective.elective_id}
                        type="button"
                        onClick={() => handleSelectElective(2, elective.elective_id)}
                        className={`elective-radio w-full text-left ${isSelected ? 'selected' : ''}`}
                        disabled={isUsedElsewhere && !isSelected}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{elective.elective_name}</p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{elective.branch_name}</p>
                          </div>
                          <span className={`badge ${isSelected ? 'badge-success' : 'badge-info'}`}>
                            {isSelected ? 'Selected' : isUsedElsewhere ? 'Taken' : 'Choose'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button type="button" className="btn-secondary w-full" onClick={toggleOtherDept}>
                  Other dept
                </button>
              </div>
            </section>
          </div>

          <div className="card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold">Ready to register?</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Select both electives and continue to save your choices.
                </p>
              </div>
              <button className="btn-primary inline-flex items-center gap-2" onClick={handleContinue} disabled={!canProceed || submitting}>
                {submitting ? 'Registering...' : 'Register'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
