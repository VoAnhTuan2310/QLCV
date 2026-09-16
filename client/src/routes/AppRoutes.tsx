import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ProtectedRoute } from './ProtectedRoute';
import { FinancePage } from '../features/finance/pages/FinancePage';
import { TaskPage } from '../features/tasks/pages/TaskPage';
import { NotePage } from '../features/notes/pages/NotePage';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Private Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<FinancePage />} />
          <Route path="/tasks" element={<TaskPage />} />
          <Route path="/notes" element={<NotePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
