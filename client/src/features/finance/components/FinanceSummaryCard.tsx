import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, ShieldCheck } from 'lucide-react';
import api from '../../../services/api';

interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const FinanceSummaryCard: React.FC = () => {
  const [summary, setSummary] = useState<FinanceSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/finance/summary');
        if (isMounted && response.data?.data) {
          setSummary(response.data.data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Không thể tải báo cáo tài chính');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-6 rounded-3xl animate-pulse space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
              <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            </div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-2/3"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-sm font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Income Card */}
      <motion.div
        whileHover={{ y: -6, scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-6 rounded-3xl text-white shadow-xl glow-emerald group"
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full inline-flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Tổng Thu Nhập
            </span>
            <h3 className="text-3xl lg:text-4xl font-black mt-3 tracking-tight drop-shadow-sm">
              {formatVND(summary.totalIncome)}
            </h3>
          </div>
          <div className="p-3.5 bg-white/20 backdrop-blur-xl rounded-2xl text-white shadow-inner group-hover:rotate-12 transition-transform duration-300">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between text-xs text-emerald-100 font-medium pt-3 border-t border-white/20">
          <span>Tích lũy tài sản an toàn</span>
          <span className="font-bold bg-white/10 px-2 py-0.5 rounded-lg">+Thu nhập</span>
        </div>
        <TrendingUp className="absolute -bottom-8 -right-8 w-36 h-36 text-white/10 pointer-events-none group-hover:scale-110 transition duration-500" />
      </motion.div>

      {/* Total Expense Card */}
      <motion.div
        whileHover={{ y: -6, scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 p-6 rounded-3xl text-white shadow-xl glow-rose group"
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-100 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full inline-flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> Tổng Chi Tiêu
            </span>
            <h3 className="text-3xl lg:text-4xl font-black mt-3 tracking-tight drop-shadow-sm">
              {formatVND(summary.totalExpense)}
            </h3>
          </div>
          <div className="p-3.5 bg-white/20 backdrop-blur-xl rounded-2xl text-white shadow-inner group-hover:-rotate-12 transition-transform duration-300">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between text-xs text-rose-100 font-medium pt-3 border-t border-white/20">
          <span>Dòng tiền đi ra hàng tháng</span>
          <span className="font-bold bg-white/10 px-2 py-0.5 rounded-lg">-Chi tiêu</span>
        </div>
        <TrendingDown className="absolute -bottom-8 -right-8 w-36 h-36 text-white/10 pointer-events-none group-hover:scale-110 transition duration-500" />
      </motion.div>

      {/* Net Balance Card */}
      <motion.div
        whileHover={{ y: -6, scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-6 rounded-3xl text-white shadow-xl glow-indigo group"
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-100 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Số Dư Khả Dụng
            </span>
            <h3 className="text-3xl lg:text-4xl font-black mt-3 tracking-tight drop-shadow-sm">
              {formatVND(summary.balance)}
            </h3>
          </div>
          <div className="p-3.5 bg-white/20 backdrop-blur-xl rounded-2xl text-white shadow-inner group-hover:scale-110 transition-transform duration-300">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between text-xs text-indigo-100 font-medium pt-3 border-t border-white/20">
          <span>Số dư dòng tiền ví khả dụng</span>
          <span className="font-bold bg-white/10 px-2 py-0.5 rounded-lg">Khả dụng</span>
        </div>
        <Wallet className="absolute -bottom-8 -right-8 w-36 h-36 text-white/10 pointer-events-none group-hover:scale-110 transition duration-500" />
      </motion.div>
    </div>
  );
};
