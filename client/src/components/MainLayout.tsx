import React from 'react';
import { Navbar } from './Navbar';
import { motion } from 'framer-motion';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-slate-100 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="bg-blob-indigo -top-40 -left-40 opacity-50 dark:opacity-40 animate-pulse pointer-events-none" />
      <div className="bg-blob-emerald top-1/3 -right-40 opacity-40 dark:opacity-30 animate-pulse pointer-events-none" />
      <div className="bg-blob-rose -bottom-40 left-1/4 opacity-40 dark:opacity-20 animate-pulse pointer-events-none" />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Container - Responsive Fluid Container */}
      <main className="relative z-10 w-full max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};
