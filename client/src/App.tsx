import React, { useEffect } from 'react';
import { AppRoutes } from './routes/AppRoutes';
import { useThemeStore } from './store/useThemeStore';

export const App: React.FC = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <AppRoutes />
    </div>
  );
};

export default App;
