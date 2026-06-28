import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  roleLabel: string;
  menuItems: { to: string; label: string; icon: React.ReactNode }[];
}

export default function Sidebar({ roleLabel, menuItems }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside
      className="w-64 min-h-screen flex flex-col shrink-0"
      style={{ background: 'var(--bg-sidebar)' }}
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
            <UserCircle className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm truncate max-w-[140px]">
              {user?.displayName}
            </p>
            <p className="text-white/60 text-xs capitalize">{roleLabel}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="sidebar-link w-full border-none bg-transparent cursor-pointer"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export const studentMenu = [
  { to: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/student/register', label: 'Register Electives', icon: <BookOpen size={20} /> },
];

export const facultyMenu = [
  { to: '/faculty/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
];

export const adminMenu = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
];
