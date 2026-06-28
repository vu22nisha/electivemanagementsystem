import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import Sidebar, { studentMenu } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { api } from '../api';
import type { BranchElectivesGroup, PrerequisiteCheckResult } from '../types';

export default function RegisterElectivesPage() {
  const [groups, setGroups] = useState<BranchElectivesGroup[]>([]);
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrereq, setAcceptPrereq] = useState(false);
  const [prereqResults, setPrereqResults] = useState<PrerequisiteCheckResult[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.getStudentDashboard().then((dash) => {
      if (dash.registration_status === 'Registered') {
        navigate('/student/dashboard');
      }
    });
    api.getAvailableElectives()
      .then(setGroups)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  const selectedIds = Object.values(selections);
  const canProceed = selectedIds.length === 2 && new Set(selectedIds).size === 2;

  const handleBranchSelect = (branchId: number, electiveId: number) => {
    setSelections((prev) => {
      const next = { ...prev };
      if (next[branchId] === electiveId) {
        delete next[branchId];
      } else {
        next[branchId] = electiveId;
      }
      return next;
    });
    setPrereqResults(null);
  };

  const handleCheckPrerequisites = async () => {
    if (!canProceed) return;
    setChecking(true);
    setError('');
    try {
      const [id1, id2] = selectedIds;
      const res = await api.checkPrerequisites(id1, id2);
      setPrereqResults(res.results);
      if (!res.all_passed) {
        setError('Some prerequisites are not met. Please choose different electives or contact admin.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Check failed');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed || !acceptTerms || !acceptPrereq) return;
    if (prereqResults && !prereqResults.every((r) => r.passed)) return;

    setSubmitting(true);
    setError('');
    try {
      const [id1, id2] = selectedIds;
      if (!prereqResults) {
        const check = await api.checkPrerequisites(id1, id2);
        if (!check.all_passed) {
          setPrereqResults(check.results);
          setError('Prerequisite requirements not met');
          return;
        }
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
    <div className="flex min-h-screen">
      <Sidebar roleLabel="Student" menuItems={studentMenu} />

      <main className="flex-1 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Register Electives</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Select one elective from two different branches ({selectedIds.length}/2 selected)
            </p>
          </div>
          <ThemeToggle />
        </div>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading electives...</p>}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'color-mix(in srgb, var(--danger) 10%, transparent)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <div className="space-y-6 animate-fade-in">
          {groups.map((group) => (
            <div key={group.branch_id} className="card p-5">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="badge badge-info">{group.branch_name}</span>
              </h2>
              <div className="space-y-3">
                {group.electives.map((elective) => {
                  const isSelected = selections[group.branch_id] === elective.elective_id;
                  const seatsLeft = elective.number_of_seats - elective.enrolled_count;
                  return (
                    <label
                      key={elective.elective_id}
                      className={`elective-radio ${isSelected ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`branch-${group.branch_id}`}
                        checked={isSelected}
                        onChange={() => handleBranchSelect(group.branch_id, elective.elective_id)}
                        disabled={seatsLeft <= 0}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{elective.elective_name}</p>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          Seats: {elective.enrolled_count}/{elective.number_of_seats}
                          {seatsLeft <= 0 ? ' · Full' : ` · ${seatsLeft} available`}
                        </p>
                        {elective.prerequisites.length > 0 && (
                          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                            <Info size={12} />
                            Prerequisites (cross-dept): {elective.prerequisites.map((p) => p.prereq_name).join(', ')}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {canProceed && (
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold">Prerequisite Verification & Terms</h3>

              {!prereqResults && (
                <button
                  className="btn-secondary"
                  onClick={handleCheckPrerequisites}
                  disabled={checking}
                >
                  {checking ? 'Checking...' : 'Verify Prerequisites'}
                </button>
              )}

              {prereqResults && (
                <div className="space-y-2">
                  {prereqResults.map((r) => (
                    <div
                      key={r.elective_id}
                      className="flex items-start gap-2 p-3 rounded-lg text-sm"
                      style={{ background: 'var(--bg-primary)' }}
                    >
                      {r.passed ? (
                        <CheckCircle2 size={18} style={{ color: 'var(--success)' }} className="shrink-0" />
                      ) : (
                        <XCircle size={18} style={{ color: 'var(--danger)' }} className="shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{r.elective_name} ({r.branch_name})</p>
                        {r.is_cross_department ? (
                          r.passed ? (
                            <p style={{ color: 'var(--success)' }}>Cross-department prerequisites satisfied</p>
                          ) : (
                            <p style={{ color: 'var(--danger)' }}>
                              Missing: {r.missing_prerequisites.join(', ')}
                            </p>
                          )
                        ) : (
                          <p style={{ color: 'var(--text-secondary)' }}>Same department — no prerequisite check required</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptPrereq}
                  onChange={(e) => setAcceptPrereq(e.target.checked)}
                  className="mt-0.5"
                />
                I confirm that I have reviewed the prerequisite requirements for my selected electives.
              </label>

              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5"
                />
                I accept the terms and conditions of elective registration at PES University.
              </label>

              <button
                className="btn-primary"
                disabled={
                  !acceptTerms ||
                  !acceptPrereq ||
                  submitting ||
                  (prereqResults !== null && !prereqResults.every((r) => r.passed))
                }
                onClick={handleSubmit}
              >
                {submitting ? 'Processing...' : 'Proceed to Faculty Preference →'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
