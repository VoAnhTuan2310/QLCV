import React from 'react';
import { Navbar } from './Navbar';
import { motion } from 'framer-motion';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="bg-blob-indigo -top-40 -left-40 opacity-70 dark:opacity-40 animate-pulse pointer-events-none" />
      <div className="bg-blob-emerald top-1/3 -right-40 opacity-60 dark:opacity-30 animate-pulse pointer-events-none" />
      <div className="bg-blob-rose -bottom-40 left-1/4 opacity-50 dark:opacity-20 animate-pulse pointer-events-none" />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};
