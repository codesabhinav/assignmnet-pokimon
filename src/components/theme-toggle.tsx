'use client';

import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <div className="relative inline-flex items-center bg-glass rounded-xl p-1 shadow-lg">
      <button
        onClick={() => setTheme('light')}
        className={cn(
          'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          theme === 'light'
            ? 'bg-white text-gray-900 shadow-md dark:bg-dark-700 dark:text-gray-100'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
        )}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>
      
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          theme === 'dark'
            ? 'bg-white text-gray-900 shadow-md dark:bg-dark-700 dark:text-gray-100'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
        )}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
      
      <button
        onClick={() => setTheme('system')}
        className={cn(
          'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          theme === 'system'
            ? 'bg-white text-gray-900 shadow-md dark:bg-dark-700 dark:text-gray-100'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
        )}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  );
}
