import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Users } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

type Role = 'student' | 'faculty' | 'admin';

const roles: { id: Role; label: string; icon: React.ReactNode; usernameLabel: string; hint: string }[] = [
  { id: 'student', label: 'Student', icon: <GraduationCap size={20} />, usernameLabel: 'SRN / Username', hint: 'Login with your SRN and password' },
  { id: 'faculty', label: 'Faculty', icon: <Users size={20} />, usernameLabel: 'Faculty ID / Username', hint: 'Login with your faculty ID and password' },
  { id: 'admin', label: 'Admin', icon: <ShieldCheck size={20} />, usernameLabel: 'Admin Username', hint: 'Login with your admin username and password' },
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ background: 'var(--accent)' }}>
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>PES University</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Elective Management System</p>
        </div>

        <div className="card p-6">
          <div className="flex gap-2 mb-6">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`role-chip flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-medium cursor-pointer transition-all border ${role === r.id ? 'active' : ''}`}
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
                placeholder={role === 'student' ? 'PES1UG25CS001' : role === 'faculty' ? 'FAC001' : 'admin'}
                required
              />
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                {selectedRole.hint}
              </p>
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
        </div>
      </div>
    </div>
  );
}
