// Common utilities and constants

export const REGISTRATION_DEADLINE = '2026-07-29T23:59:59';

export const colors = {
  light: {
    bg: {
      primary: '#FFFFFF',
      secondary: '#F8F9FB',
      tertiary: '#F0F2F7',
    },
    text: {
      primary: '#1A1F2E',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
    },
    accent: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#0EA5E9',
  },
  dark: {
    bg: {
      primary: '#0F1419',
      secondary: '#1A1F2E',
      tertiary: '#252D3D',
    },
    text: {
      primary: '#F3F4F6',
      secondary: '#D1D5DB',
      tertiary: '#9CA3AF',
    },
    accent: '#60A5FA',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    info: '#38BDF8',
  },
};

export const animations = {
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },
  cardHover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.3 },
  },
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const timeUntil = (deadline: string | Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
} => {
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const now = new Date();
  const diff = deadlineDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};
