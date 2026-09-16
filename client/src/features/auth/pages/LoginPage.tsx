import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, Sun, Moon } from 'lucide-react';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import { useThemeStore } from '../../../store/useThemeStore';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { isDarkMode, toggleTheme } = useThemeStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { user, token } = response.data.data;
      setAuth(user, token);
      navigate('/');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 p-4 overflow-hidden text-slate-100">
      {/* Ambient Glow Background Orbs */}
      <div className="bg-blob-indigo -top-20 -left-20 opacity-60 animate-pulse pointer-events-none" />
      <div className="bg-blob-rose -bottom-20 -right-20 opacity-50 animate-pulse pointer-events-none" />

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-2xl bg-white/10 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 text-white hover:scale-110 transition duration-300 z-20"
      >
        {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 max-w-md w-full glass-card p-8 sm:p-10 rounded-3xl border border-white/20 shadow-2xl"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/40 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Chào Mừng <span className="text-gradient">Trở Lại</span>
          </h1>
          <p className="text-slate-400 text-xs mt-2 font-medium">
            Đăng nhập để tiếp tục quản lý Thu/Chi & Công Việc
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Địa Chỉ Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="glass-input w-full pl-11 pr-4 py-3 text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Mật Khẩu
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input w-full pl-11 pr-4 py-3 text-sm font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-500/30 transition duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400 font-medium">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
