import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Mail, Sparkles } from 'lucide-react';
import Sidebar, { studentMenu } from '../components/Sidebar';
import { api } from '../api';
import type { BranchElectivesGroup, StudentDashboard } from '../types';

function formatDeadline(days = 10) {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + days);
  return deadline.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboard | null>(null);
  const [electives, setElectives] = useState<BranchElectivesGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getStudentDashboard(), api.getAvailableElectives()])
      .then(([dashboard, available]) => {
        setData(dashboard);
        setElectives(available);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const isRegistered = data?.registration_status === 'Registered';
  const firstName = data?.student_name?.split(' ')[0] || 'Student';
  const selectedElectives = [data?.elective_1, data?.elective_2];
  const electiveCount = selectedElectives.filter(Boolean).length;
  const registerLabel = 'Register';
  const registerLink = '/student/register';

  const activeAction = { label: registerLabel, link: registerLink };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar roleLabel="Student" menuItems={studentMenu} />

      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="hero-banner card p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm" style={{ borderColor: 'color-mix(in srgb, var(--accent) 18%, var(--border-color))', background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}>
                  <Sparkles size={16} />
                  Elective registration dashboard
                </div>
                <div>
                  <h1 className="text-3xl font-semibold">Welcome, {firstName}.</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                    Semester 5 student portal with sections A to L and elective registration details.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 items-start sm:items-end">
                <div className="email-pill">
                  <Mail size={16} />
                  <span>{data?.email || 'no-reply@pes.edu'}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  {activeAction && (
                    <Link to={activeAction.link} className="btn-primary inline-flex items-center gap-2 no-underline">
                      {activeAction.label}
                      <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {loading && <div className="card p-6 text-sm" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</div>}
          {error && <div className="card p-4 text-sm" style={{ color: 'var(--danger)' }}>{error}</div>}

          {data && (
            <div className="animate-fade-in space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="stat-card dashboard-card">
                  <p className="text-sm font-medium uppercase tracking-[0.24em]" style={{ color: 'var(--text-secondary)' }}>Student details</p>
                  <p className="mt-4 text-2xl font-semibold">{data.student_name}</p>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {data.branch_name || 'Computer Science & Engineering'} • Semester 5
                  </p>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Section A–L • 65 students per section
                  </p>
                </div>

                <div className="stat-card dashboard-card">
                  <p className="text-sm font-medium uppercase tracking-[0.24em]" style={{ color: 'var(--text-secondary)' }}>CGPA</p>
                  <p className="mt-4 text-4xl font-bold" style={{ color: 'var(--success)' }}>{data.cgpa.toFixed(2)}</p>
                  <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>Your latest academic score.</p>
                </div>

                <div className="stat-card dashboard-card">
                  <p className="text-sm font-medium uppercase tracking-[0.24em]" style={{ color: 'var(--text-secondary)' }}>Registration status</p>
                  <p className="mt-4 text-4xl font-bold">{data.registration_status || 'Not registered'}</p>
                  <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {electiveCount === 2 ? 'Both elective slots selected' : `${electiveCount} of 2 elective slots selected`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedElectives.map((elective, index) => (
                  <div key={index} className="card p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--text-secondary)' }}>
                      Elective {index + 1}
                    </p>
                    {elective ? (
                      <>
                        <p className="mt-4 text-xl font-semibold">{elective.elective_name}</p>
                        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{elective.branch_name}</p>
                        <span className="badge badge-success mt-4">Registered</span>
                      </>
                    ) : (
                      <>
                        <p className="mt-4 text-xl font-semibold">Not registered</p>
                        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Select this slot in the registration screen.
                        </p>
                        <span className="badge badge-warning mt-4">Not registered</span>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-semibold">Ready to finish registration?</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Use the register page below to choose your electives for both slots.
                  </p>
                </div>
                <Link to={registerLink} className="btn-primary inline-flex items-center gap-2">
                  {registerLabel}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
