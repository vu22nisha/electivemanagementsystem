import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Award, ClipboardCheck, BookOpen, AlertCircle } from 'lucide-react';
import Sidebar, { studentMenu } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { api } from '../api';
import type { StudentDashboard } from '../types';

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getStudentDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const isRegistered = data?.registration_status === 'Registered';

  return (
    <div className="flex min-h-screen">
      <Sidebar roleLabel="Student" menuItems={studentMenu} />

      <main className="flex-1 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Semester {data?.semester} · {data?.branch_name}
            </p>
          </div>
          <ThemeToggle />
        </div>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>}
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

        {data && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}>
                    <User size={20} style={{ color: 'var(--accent)' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Student Details</span>
                </div>
                <p className="font-semibold text-lg">{data.student_name}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{data.srn}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Section {data.section}</p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--success) 12%, transparent)' }}>
                    <Award size={20} style={{ color: 'var(--success)' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>CGPA</span>
                </div>
                <p className="font-bold text-3xl" style={{ color: 'var(--success)' }}>{data.cgpa.toFixed(2)}</p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--warning) 12%, transparent)' }}>
                    <ClipboardCheck size={20} style={{ color: 'var(--warning)' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Registration Status</span>
                </div>
                <span className={`badge ${isRegistered ? 'badge-success' : 'badge-warning'}`}>
                  {data.registration_status}
                </span>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen size={20} />
                  Your Electives
                </h2>
                {!isRegistered && (
                  <Link to="/student/register" className="btn-primary no-underline text-sm">
                    Register Electives
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ElectiveCard
                  label="Elective 1"
                  elective={data.elective_1}
                  isRegistered={isRegistered}
                />
                <ElectiveCard
                  label="Elective 2"
                  elective={data.elective_2}
                  isRegistered={isRegistered}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ElectiveCard({
  label,
  elective,
  isRegistered,
}: {
  label: string;
  elective?: import('../types').Elective | null;
  isRegistered: boolean;
}) {
  if (!elective) {
    return (
      <div
        className="p-4 rounded-lg border-2 border-dashed flex items-start gap-3"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <AlertCircle size={20} style={{ color: 'var(--warning)' }} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Not chosen yet
          </p>
        </div>
      </div>
    );
  }

  const seatsLeft = elective.number_of_seats - elective.enrolled_count;

  return (
    <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
        {isRegistered && <span className="badge badge-success">Registered</span>}
      </div>
      <p className="font-semibold">{elective.elective_name}</p>
      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{elective.branch_name}</p>
      <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
        Seats: {elective.enrolled_count}/{elective.number_of_seats} ({seatsLeft} available)
      </p>
    </div>
  );
}
