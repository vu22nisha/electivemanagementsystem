import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border cursor-pointer transition-colors"
      style={{
        borderColor: 'var(--border-color)',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
      }}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
