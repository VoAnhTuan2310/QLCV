import React from 'react';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppRoutes />
    </div>
  );
};

export default App;
