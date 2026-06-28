import { useEffect, useState } from 'react';
import { BookOpen, Users } from 'lucide-react';
import Sidebar, { facultyMenu } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { api } from '../api';
import type { FacultyDashboard } from '../types';

export default function FacultyDashboardPage() {
  const [data, setData] = useState<FacultyDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFacultyDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar roleLabel="Faculty" menuItems={facultyMenu} />

      <main className="flex-1 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Welcome, {data?.faculty_name}
            </p>
          </div>
          <ThemeToggle />
        </div>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>}

        {data && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="stat-card">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen size={20} style={{ color: 'var(--accent)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Assigned Electives</span>
                </div>
                <p className="text-3xl font-bold">{data.electives.length}</p>
              </div>
              <div className="stat-card">
                <div className="flex items-center gap-3 mb-2">
                  <Users size={20} style={{ color: 'var(--success)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Registered Students</span>
                </div>
                <p className="text-3xl font-bold">{data.student_count}</p>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Your Electives</h2>
              <div className="space-y-3">
                {data.electives.map((e) => (
                  <div
                    key={e.elective_id}
                    className="p-4 rounded-lg border flex justify-between items-center"
                    style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}
                  >
                    <div>
                      <p className="font-medium">{e.elective_name}</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{e.branch_name}</p>
                    </div>
                    <span className="badge badge-info">
                      {e.enrolled_count}/{e.number_of_seats} seats
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
