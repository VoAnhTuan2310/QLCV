import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Search, Plus, Filter, Trash2, Pencil, PieChart as PieIcon, ArrowUpCircle, ArrowDownCircle, Sparkles, X } from 'lucide-react';
import { FinanceSummaryCard, formatVND } from '../components/FinanceSummaryCard';
import { MainLayout } from '../../../components/MainLayout';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  date: string;
  category?: Category;
}

const CHART_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

const formatNumberWithCommas = (val: string): string => {
  const digitsOnly = val.replace(/\D/g, '');
  if (!digitsOnly) return '';
  return new Intl.NumberFormat('vi-VN').format(Number(digitsOnly));
};

const getRawNumber = (formattedVal: string): number => {
  const digitsOnly = formattedVal.replace(/\D/g, '');
  return Number(digitsOnly) || 0;
};

export const FinancePage: React.FC = () => {
  const { user } = useAuthStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  // Add Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editTxId, setEditTxId] = useState<string>('');
  const [editAmount, setEditAmount] = useState<string>('');
  const [editType, setEditType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [editCategoryId, setEditCategoryId] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/finance/transactions');
      if (res.data?.data) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách giao dịch', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (): Promise<Category[]> => {
    try {
      const res = await api.get('/finance/categories');
      const cats: Category[] = res.data?.data || [];
      setCategories(cats);
      return cats;
    } catch (err) {
      console.error('Lỗi tải danh mục', err);
      return [];
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [refreshKey]);

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) return;
    try {
      await api.delete(`/finance/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      alert('Xóa giao dịch thất bại!');
    }
  };

  const handleOpenModal = async () => {
    setFormError(null);
    setIsModalOpen(true);

    let currentCats = categories;
    if (currentCats.length === 0) {
      currentCats = await fetchCategories();
    }

    const matchingCats = currentCats.filter((c) => c.type === type);

    if (matchingCats.length > 0) {
      setCategoryId(matchingCats[0].id);
    } else {
      try {
        const defaultCatRes = await api.post('/finance/categories', {
          name: type === 'INCOME' ? 'Lương / Thu Nhập' : 'Ăn Uống / Chi Tiêu',
          type,
        });
        const newCat = defaultCatRes.data.data;
        setCategories((prev) => [...prev, newCat]);
        setCategoryId(newCat.id);
      } catch (err) {
        console.error('Lỗi tạo danh mục mặc định', err);
      }
    }
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditFormError(null);
    setEditTxId(tx.id);
    setEditAmount(formatNumberWithCommas(tx.amount.toString()));
    setEditType(tx.type);
    setEditCategoryId(tx.category?.id || '');
    setEditDescription(tx.description || '');
    setIsEditModalOpen(true);
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const rawAmount = getRawNumber(amount);
    if (rawAmount <= 0) {
      setFormError('Vui lòng nhập số tiền hợp lệ lớn hơn 0');
      return;
    }

    if (!categoryId) {
      setFormError('Vui lòng chọn danh mục thu/chi');
      return;
    }

    try {
      setSubmitLoading(true);
      await api.post('/finance/transactions', {
        amount: rawAmount,
        type,
        categoryId,
        description: description || undefined,
        date: new Date().toISOString(),
      });

      setIsModalOpen(false);
      setAmount('');
      setDescription('');
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Tạo giao dịch thất bại!');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditFormError(null);

    const rawAmount = getRawNumber(editAmount);
    if (rawAmount <= 0) {
      setEditFormError('Vui lòng nhập số tiền hợp lệ lớn hơn 0');
      return;
    }

    try {
      setEditLoading(true);
      await api.put(`/finance/transactions/${editTxId}`, {
        amount: rawAmount,
        type: editType,
        categoryId: editCategoryId || undefined,
        description: editDescription || undefined,
      });

      setIsEditModalOpen(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      setEditFormError(err.response?.data?.message || 'Cập nhật giao dịch thất bại!');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = filterType === 'ALL' || tx.type === filterType;
    const matchesSearch =
      !searchQuery ||
      (tx.description && tx.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.category?.name && tx.category.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const expenseChartData = React.useMemo(() => {
    const expenseMap: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        const catName = t.category?.name || 'Khác';
        expenseMap[catName] = (expenseMap[catName] || 0) + Number(t.amount);
      });

    return Object.entries(expenseMap).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions]);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Hero Banner */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-white/40 dark:border-slate-800/80">
          <div className="space-y-1 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Dashboard Thu / Chi
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Tổng quan <span className="text-gradient">Tài chính</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Xin chào, <span className="font-bold text-slate-700 dark:text-slate-200">{user?.fullName || user?.email}</span>! Quản lý thu chi thông minh và theo dõi dòng tiền hiệu quả.
            </p>
          </div>

          <div className="z-10 flex items-center gap-3">
            <button
              onClick={handleOpenModal}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi Nhận Giao Dịch</span>
            </button>
          </div>
        </div>

        {/* Row 1: Finance Summary Cards */}
        <FinanceSummaryCard key={refreshKey} />

        {/* Row 2: 2-Column Grid (Analytics Chart + Transaction History) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Column 1: Category Expense Pie/Donut Chart */}
          <div className="lg:col-span-5 glass-card p-6 rounded-3xl flex flex-col justify-between transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <PieIcon className="w-5 h-5" />
                </div>
                <span>Tỷ Trọng Chi Tiêu</span>
              </h2>
              <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                Theo danh mục
              </span>
            </div>

            {expenseChartData.length === 0 ? (
              <div className="py-24 text-center text-slate-400 dark:text-slate-500 text-sm">
                Chưa có dữ liệu chi tiêu để hiển thị biểu đồ.
              </div>
            ) : (
              <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => formatVND(Number(val) || 0)}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Column 2: Transaction History with Search & Filter */}
          <div className="lg:col-span-7 glass-card rounded-3xl flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
            {/* Header & Filter Bar */}
            <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/60 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lịch Sử Giao Dịch</h2>
                <span className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold px-3 py-1 rounded-full">
                  {filteredTransactions.length} giao dịch
                </span>
              </div>

              {/* Filter Inputs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm theo tên hoặc danh mục..."
                    className="glass-input w-full pl-10 pr-4 py-2 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="glass-input px-3 py-2 text-sm font-semibold"
                  >
                    <option value="ALL">Tất cả loại</option>
                    <option value="INCOME">Thu Nhập (+)</option>
                    <option value="EXPENSE">Chi Tiêu (-)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scrollable Table */}
            <div className="max-h-[460px] overflow-y-auto flex-1 p-2">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 z-10">
                  <tr className="text-slate-400 dark:text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">
                    <th className="py-3 px-4">Ngày</th>
                    <th className="py-3 px-4">Loại</th>
                    <th className="py-3 px-4">Danh mục</th>
                    <th className="py-3 px-4">Mô tả</th>
                    <th className="py-3 px-4 text-right">Số tiền</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400 animate-pulse">
                        Đang tải lịch sử giao dịch...
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400">
                        Không có giao dịch nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition duration-150 group"
                      >
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs font-medium">
                          {new Date(tx.date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full ${
                              tx.type === 'INCOME'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {tx.type === 'INCOME' ? (
                              <>
                                <ArrowUpCircle className="w-3.5 h-3.5" /> Thu Nhập
                              </>
                            ) : (
                              <>
                                <ArrowDownCircle className="w-3.5 h-3.5" /> Chi Tiêu
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                          {tx.category?.name || 'Khác'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-[150px] truncate text-xs">
                          {tx.description || '-'}
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-black text-base ${
                            tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {tx.type === 'INCOME' ? '+' : '-'} {formatVND(tx.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleOpenEditModal(tx)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                              title="Sửa giao dịch"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Xóa giao dịch"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Add New Transaction */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="glass-card max-w-md w-full p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <span>Ghi Nhận Giao Dịch Mới</span>
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formError && (
                  <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleCreateTransaction} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Loại Giao Dịch
                    </label>
                    <select
                      value={type}
                      onChange={(e) => {
                        const newType = e.target.value as 'INCOME' | 'EXPENSE';
                        setType(newType);
                        const matchingCats = categories.filter((c) => c.type === newType);
                        if (matchingCats.length > 0) setCategoryId(matchingCats[0].id);
                      }}
                      className="glass-input w-full px-4 py-2.5 text-sm font-semibold"
                    >
                      <option value="EXPENSE">Chi Tiêu (-)</option>
                      <option value="INCOME">Thu Nhập (+)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Số Tiền (VNĐ)
                    </label>
                    <input
                      type="text"
                      required
                      value={amount}
                      onChange={(e) => setAmount(formatNumberWithCommas(e.target.value))}
                      placeholder="Ví dụ: 500.000"
                      className="glass-input w-full px-4 py-3 text-lg font-black text-indigo-600 dark:text-indigo-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Danh Mục
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="glass-input w-full px-4 py-2.5 text-sm font-semibold"
                    >
                      {categories
                        .filter((c) => c.type === type)
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Mô Tả Ghi Chú
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ví dụ: Ăn trưa hoặc Lương tháng 9"
                      className="glass-input w-full px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200/50 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/30 transition disabled:opacity-50"
                    >
                      {submitLoading ? 'Đang lưu...' : 'Lưu Giao Dịch'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal Edit Transaction */}
        <AnimatePresence>
          {isEditModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="glass-card max-w-md w-full p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-indigo-500" />
                    <span>Chỉnh Sửa Giao Dịch</span>
                  </h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {editFormError && (
                  <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold">
                    {editFormError}
                  </div>
                )}

                <form onSubmit={handleUpdateTransaction} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Loại Giao Dịch
                    </label>
                    <select
                      value={editType}
                      onChange={(e) => {
                        const newType = e.target.value as 'INCOME' | 'EXPENSE';
                        setEditType(newType);
                        const matchingCats = categories.filter((c) => c.type === newType);
                        if (matchingCats.length > 0) setEditCategoryId(matchingCats[0].id);
                      }}
                      className="glass-input w-full px-4 py-2.5 text-sm font-semibold"
                    >
                      <option value="EXPENSE">Chi Tiêu (-)</option>
                      <option value="INCOME">Thu Nhập (+)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Số Tiền (VNĐ)
                    </label>
                    <input
                      type="text"
                      required
                      value={editAmount}
                      onChange={(e) => setEditAmount(formatNumberWithCommas(e.target.value))}
                      className="glass-input w-full px-4 py-3 text-lg font-black text-indigo-600 dark:text-indigo-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Danh Mục
                    </label>
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                      className="glass-input w-full px-4 py-2.5 text-sm font-semibold"
                    >
                      {categories
                        .filter((c) => c.type === editType)
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Mô Tả Ghi Chú
                    </label>
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="glass-input w-full px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200/50 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/30 transition disabled:opacity-50"
                    >
                      {editLoading ? 'Đang cập nhật...' : 'Cập Nhật Giao Dịch'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};
