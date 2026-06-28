import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

type Role = 'student' | 'faculty' | 'admin';

const roles: { id: Role; label: string; icon: React.ReactNode; usernameLabel: string }[] = [
  { id: 'student', label: 'Student', icon: <GraduationCap size={22} />, usernameLabel: 'SRN / Username' },
  { id: 'faculty', label: 'Faculty', icon: <Users size={22} />, usernameLabel: 'Faculty ID / Username' },
  { id: 'admin', label: 'Administrator', icon: <ShieldCheck size={22} />, usernameLabel: 'Admin Username' },
];

export default function LoginPage() {
  const [role, setRole] = useState<Role>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const selectedRole = roles.find((r) => r.id === role)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(role, username, password);
      login({
        token: res.access_token,
        role: res.role as Role,
        displayName: res.display_name,
        userId: res.user_id,
      });
      navigate(`/${res.role}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'var(--accent)' }}
          >
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            PES University
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Elective Management System
          </p>
          <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
            Welcome! Please sign in to continue.
          </p>
        </div>

        <div className="card p-6">
          <div className="flex gap-2 mb-6">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-xs font-medium cursor-pointer transition-all border"
                style={{
                  background: role === r.id ? 'var(--accent)' : 'var(--bg-primary)',
                  color: role === r.id ? 'white' : 'var(--text-secondary)',
                  borderColor: role === r.id ? 'var(--accent)' : 'var(--border-color)',
                }}
              >
                {r.icon}
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                {selectedRole.usernameLabel}
              </label>
              <input
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={role === 'student' ? 'PES1UG22CS001' : role === 'faculty' ? 'FAC001' : 'admin'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Password
              </label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--danger) 10%, transparent)', color: 'var(--danger)' }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t text-xs space-y-1" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            <p className="font-medium">Demo credentials:</p>
            <p>Student: PES1UG22CS001 / student123</p>
            <p>Faculty: FAC001 / faculty123</p>
            <p>Admin: admin / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
