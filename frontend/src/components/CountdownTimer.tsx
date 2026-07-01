import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  deadline: string | Date;
  onExpire?: () => void;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export default function CountdownTimer({ deadline, onExpire, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
      const now = new Date();
      const diff = deadlineDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        onExpire?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [deadline, onExpire]);

  if (timeLeft.expired) {
    return (
      <div className="text-center">
        <div className="text-sm font-semibold text-red-600 dark:text-red-400">Registration Closed</div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      <motion.div className="flex flex-col items-center">
        <div className="relative w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg flex items-center justify-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{String(timeLeft.days).padStart(2, '0')}</div>
        </div>
        <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Days</span>
      </motion.div>

      <motion.div className="flex flex-col items-center">
        <div className="relative w-16 h-16 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-lg flex items-center justify-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{String(timeLeft.hours).padStart(2, '0')}</div>
        </div>
        <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Hours</span>
      </motion.div>

      <motion.div className="flex flex-col items-center">
        <div className="relative w-16 h-16 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/20 rounded-lg flex items-center justify-center">
          <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{String(timeLeft.minutes).padStart(2, '0')}</div>
        </div>
        <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Mins</span>
      </motion.div>

      <motion.div className="flex flex-col items-center">
        <div className="relative w-16 h-16 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-lg flex items-center justify-center">
          <motion.div
            className="text-2xl font-bold text-amber-600 dark:text-amber-400"
            animate={{ scale: timeLeft.seconds <= 5 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.6, repeat: timeLeft.seconds <= 5 ? Infinity : 0 }}
          >
            {String(timeLeft.seconds).padStart(2, '0')}
          </motion.div>
        </div>
        <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Secs</span>
      </motion.div>
    </div>
  );
}
