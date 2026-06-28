import { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, Building2 } from 'lucide-react';
import Sidebar, { adminMenu } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { api } from '../api';
import type { AdminStats, AdminStudent } from '../types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAdminStats(), api.getAdminStudents()])
      .then(([s, st]) => {
        setStats(s);
        setStudents(st);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar roleLabel="Administrator" menuItems={adminMenu} />

      <main className="flex-1 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Administrator Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              System overview and student registrations
            </p>
          </div>
          <ThemeToggle />
        </div>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>}

        {stats && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<Users size={20} />} label="Total Students" value={stats.total_students} />
              <StatCard icon={<GraduationCap size={20} />} label="Registered" value={stats.registered_students} />
              <StatCard icon={<BookOpen size={20} />} label="Electives" value={stats.total_electives} />
              <StatCard icon={<Building2 size={20} />} label="Branches" value={stats.total_branches} />
            </div>

            <div className="card p-6 overflow-x-auto">
              <h2 className="text-lg font-semibold mb-4">Student Registrations</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th className="text-left py-2 pr-4">SRN</th>
                    <th className="text-left py-2 pr-4">Name</th>
                    <th className="text-left py-2 pr-4">Branch</th>
                    <th className="text-left py-2 pr-4">CGPA</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-left py-2 pr-4">Elective 1</th>
                    <th className="text-left py-2">Elective 2</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.srn} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="py-3 pr-4 font-mono text-xs">{s.srn}</td>
                      <td className="py-3 pr-4">{s.student_name}</td>
                      <td className="py-3 pr-4">{s.branch_name}</td>
                      <td className="py-3 pr-4">{s.cgpa.toFixed(2)}</td>
                      <td className="py-3 pr-4">
                        <span className={`badge ${s.registration_status === 'Registered' ? 'badge-success' : 'badge-warning'}`}>
                          {s.registration_status}
                        </span>
                      </td>
                      <td className="py-3 pr-4">{s.elective_1 || '—'}</td>
                      <td className="py-3">{s.elective_2 || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
