import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, Calendar as CalendarIcon, LayoutGrid, CheckCircle2, Clock, Trash2, Pencil, Sparkles, X, AlertCircle, Bell, BellRing } from 'lucide-react';
import { MainLayout } from '../../../components/MainLayout';
import api from '../../../services/api';
import {
  requestNotificationPermission,
  getNotificationPermissionState,
  sendBrowserNotification,
} from '../../../services/notificationHelper';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  createdAt: string;
}

export const TaskPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // View Mode: Calendar or Kanban Cards
  const [viewMode, setViewMode] = useState<'calendar' | 'kanban'>('calendar');

  // Notification & Toast State
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(getNotificationPermissionState());
  const [activeToast, setActiveToast] = useState<{
    id: string;
    title: string;
    timeStr: string;
    description?: string;
  } | null>(null);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [newDescription, setNewDescription] = useState<string>('');
  const [addLoading, setAddLoading] = useState<boolean>(false);

  // Detail Modal State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editTaskId, setEditTaskId] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editPriority, setEditPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [editStatus, setEditStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'>('TODO');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editLoading, setEditLoading] = useState<boolean>(false);

  const formatToDatetimeLocal = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const formatVietnameseDateTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const datePart = d.toLocaleDateString('vi-VN');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} - ${datePart}`;
  };

  const handleToggleNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(getNotificationPermissionState());
    if (granted) {
      sendBrowserNotification('🔔 Nhắc Nhở Công Việc Đã Bật', {
        body: 'Bạn sẽ nhận được thông báo trình duyệt và âm thanh khi đến giờ thực hiện công việc!',
      });
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks');
      if (res.data?.data) {
        setTasks(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Task Due Date Reminder Polling Engine (checks every 15s)
  useEffect(() => {
    if (tasks.length === 0) return;

    const checkReminders = () => {
      const now = new Date().getTime();
      const stored = localStorage.getItem('quantum_notified_task_ids');
      const notifiedIds = new Set<string>(stored ? JSON.parse(stored) : []);

      tasks.forEach((task) => {
        if (!task.dueDate || task.status === 'DONE' || task.status === 'CANCELLED') return;

        const dueTime = new Date(task.dueDate).getTime();
        if (isNaN(dueTime)) return;

        const diffInMs = dueTime - now;
        // Trigger if task due time is within the next 60s or overdue by <= 3 minutes
        if (diffInMs <= 60000 && diffInMs >= -180000 && !notifiedIds.has(task.id)) {
          notifiedIds.add(task.id);

          const timeFormatted = formatVietnameseDateTime(task.dueDate);
          const bodyText = `Đã đến giờ thực hiện (${timeFormatted})${
            task.description ? `: ${task.description}` : ''
          }`;

          sendBrowserNotification(`⏰ Nhắc Nhở: ${task.title}`, {
            body: bodyText,
          });

          setActiveToast({
            id: task.id,
            title: task.title,
            timeStr: timeFormatted,
            description: task.description,
          });
        }
      });

      localStorage.setItem('quantum_notified_task_ids', JSON.stringify(Array.from(notifiedIds)));
    };

    checkReminders();
    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, [tasks]);

  const handleDateClick = (arg: { dateStr: string }) => {
    setNewTitle('');
    setNewDescription('');
    setNewPriority('MEDIUM');
    const now = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setNewDueDate(arg.dateStr.includes('T') ? arg.dateStr.slice(0, 16) : `${arg.dateStr}T${timeStr}`);
    setIsAddModalOpen(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setAddLoading(true);
      const res = await api.post('/tasks', {
        title: newTitle.trim(),
        description: newDescription || undefined,
        priority: newPriority,
        dueDate: newDueDate ? new Date(newDueDate).toISOString() : undefined,
        status: 'TODO',
      });

      if (res.data?.data) {
        setTasks((prev) => [res.data.data, ...prev]);
        setIsAddModalOpen(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Tạo công việc mới thất bại!');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const taskId = clickInfo.event.id;
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsDetailModalOpen(true);
    }
  };

  const handleOpenEditModal = (task: Task) => {
    setEditTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setEditStatus(task.status);
    setEditDueDate(task.dueDate ? formatToDatetimeLocal(task.dueDate) : '');
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editTaskId) return;

    try {
      setEditLoading(true);
      const res = await api.put(`/tasks/${editTaskId}`, {
        title: editTitle.trim(),
        description: editDescription || undefined,
        priority: editPriority,
        status: editStatus,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
      });

      if (res.data?.data) {
        const updated = res.data.data;
        setTasks((prev) => prev.map((t) => (t.id === editTaskId ? updated : t)));
        setIsEditModalOpen(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cập nhật công việc thất bại!');
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleComplete = async (targetTask?: Task) => {
    const taskToUpdate = targetTask || selectedTask;
    if (!taskToUpdate) return;

    const newStatus = taskToUpdate.status === 'DONE' ? 'TODO' : 'DONE';

    try {
      setActionLoading(true);
      await api.put(`/tasks/${taskToUpdate.id}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskToUpdate.id ? { ...t, status: newStatus } : t))
      );
      if (isDetailModalOpen) setIsDetailModalOpen(false);
    } catch (err) {
      alert('Cập nhật trạng thái thất bại!');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async (targetTask?: Task) => {
    const taskToDelete = targetTask || selectedTask;
    if (!taskToDelete) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa công việc "${taskToDelete.title}"?`)) return;

    try {
      setActionLoading(true);
      await api.delete(`/tasks/${taskToDelete.id}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      if (isDetailModalOpen) setIsDetailModalOpen(false);
    } catch (err) {
      alert('Xóa công việc thất bại!');
    } finally {
      setActionLoading(false);
    }
  };

  const calendarEvents = tasks.map((task) => {
    const isDone = task.status === 'DONE';
    let bgColor = '#6366f1'; // Indigo for TODO
    if (isDone) bgColor = '#10b981'; // Emerald Green for DONE
    else if (task.priority === 'URGENT') bgColor = '#ef4444'; // Red for URGENT
    else if (task.priority === 'HIGH') bgColor = '#f97316'; // Orange for HIGH

    return {
      id: task.id,
      title: `${isDone ? '✓ ' : ''}${task.title}`,
      start: task.dueDate || task.createdAt,
      backgroundColor: bgColor,
      borderColor: bgColor,
      textColor: '#ffffff',
      className: isDone ? 'line-through opacity-75' : '',
    };
  });

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      case 'MEDIUM':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Toast Reminder Alert Banner */}
        <AnimatePresence>
          {activeToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 text-white shadow-2xl flex items-center justify-between border border-white/20"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <BellRing className="w-6 h-6 text-white animate-bounce" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm flex items-center gap-2">
                    <span>⏰ Đã đến giờ thực hiện công việc!</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-semibold">{activeToast.timeStr}</span>
                  </h4>
                  <p className="text-xs font-bold text-amber-100 mt-0.5">{activeToast.title}</p>
                  {activeToast.description && (
                    <p className="text-[11px] text-white/80 line-clamp-1">{activeToast.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setActiveToast(null)}
                className="p-1.5 hover:bg-white/20 rounded-xl transition text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Hero Banner */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border border-white/40 dark:border-slate-800/80">
          <div className="space-y-1 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Quản Lý Tiến Độ
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Lịch & Thẻ <span className="text-gradient">Công Việc</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Theo dõi lịch làm việc, quản lý các task quan trọng và nhận thông báo nhắc nhở đúng giờ.
            </p>
          </div>

          <div className="z-10 flex flex-wrap items-center gap-3">
            {/* Browser Reminders Toggle Button */}
            <button
              onClick={handleToggleNotificationPermission}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition border ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="Bật/Tắt thông báo trình duyệt & âm thanh nhắc nhở"
            >
              {notificationPermission === 'granted' ? (
                <>
                  <BellRing className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span>Đã Bật Nhắc Nhở</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span>Bật Thông Báo</span>
                </>
              )}
            </button>

            {/* View Mode Switcher */}
            <div className="flex bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-300/40 dark:border-slate-700/40">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  viewMode === 'calendar'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Xem Lịch</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Thẻ Kanban</span>
              </button>
            </div>

            <button
              onClick={() => {
                setNewTitle('');
                setNewDescription('');
                setNewPriority('MEDIUM');
                setNewDueDate(formatToDatetimeLocal(new Date().toISOString()));
                setIsAddModalOpen(true);
              }}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Công Việc</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* CALENDAR VIEW OR KANBAN VIEW */}
        {viewMode === 'calendar' ? (
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/40 dark:border-slate-800/80 shadow-xl overflow-hidden">
            {loading ? (
              <div className="py-24 text-center text-slate-400 font-semibold animate-pulse">
                Đang tải dữ liệu lịch...
              </div>
            ) : (
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                buttonText={{
                  today: 'Hôm nay',
                  month: 'Tháng',
                  week: 'Tuần',
                  day: 'Ngày',
                }}
                editable={true}
                selectable={true}
                events={calendarEvents}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                height="auto"
                aspectRatio={1.8}
              />
            )}
          </div>
        ) : (
          /* KANBAN GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-20 text-center text-slate-400 font-semibold animate-pulse">
                Đang tải danh sách công việc...
              </div>
            ) : tasks.length === 0 ? (
              <div className="col-span-full glass-card p-12 text-center text-slate-400 rounded-3xl">
                Chưa có công việc nào. Nhấn "Thêm Công Việc" để bắt đầu!
              </div>
            ) : (
              tasks.map((task) => (
                <motion.div
                  key={task.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`glass-card p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
                    task.status === 'DONE'
                      ? 'border-emerald-500/30 opacity-80 bg-emerald-50/10'
                      : 'border-slate-200/60 dark:border-slate-800/80'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          {formatVietnameseDateTime(task.dueDate)}
                        </span>
                      )}
                    </div>
                    <h3
                      className={`text-lg font-bold text-slate-900 dark:text-white ${
                        task.status === 'DONE' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        task.status === 'DONE'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{task.status === 'DONE' ? 'Đã Xong' : 'Hoàn Thành'}</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(task)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                        title="Chỉnh sửa công việc"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Xóa công việc"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* MODAL 1: ADD NEW TASK */}
        <AnimatePresence>
          {isAddModalOpen && (
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
                    <span>Thêm Công Việc Mới</span>
                  </h3>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Tên Công Việc
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ví dụ: Hoàn thành thiết kế UI hoặc Họp team"
                      className="glass-input w-full px-4 py-2.5 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Ngày & Giờ Thực Hiện
                    </label>
                    <input
                      type="datetime-local"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="glass-input w-full px-4 py-2.5 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Độ Ưu Tiên
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="glass-input w-full px-4 py-2.5 text-sm font-semibold"
                    >
                      <option value="LOW">Thấp (Low)</option>
                      <option value="MEDIUM">Trung Bình (Medium)</option>
                      <option value="HIGH">Cao (High)</option>
                      <option value="URGENT">Khẩn Cấp (Urgent)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Mô Tả Ghi Chú
                    </label>
                    <textarea
                      rows={3}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Nhập ghi chú chi tiết..."
                      className="glass-input w-full px-4 py-2.5 text-sm"
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200/50 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={addLoading}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/30 transition disabled:opacity-50"
                    >
                      {addLoading ? 'Đang lưu...' : 'Lưu Công Việc'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 2: EDIT TASK */}
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
                    <span>Chỉnh Sửa Công Việc</span>
                  </h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateTask} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Tên Công Việc
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="glass-input w-full px-4 py-2.5 text-sm font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Trạng Thái
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as any)}
                        className="glass-input w-full px-3 py-2.5 text-xs font-semibold"
                      >
                        <option value="TODO">Chưa Xong (TODO)</option>
                        <option value="DONE">✓ Hoàn Thành (DONE)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Độ Ưu Tiên
                      </label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value as any)}
                        className="glass-input w-full px-3 py-2.5 text-xs font-semibold"
                      >
                        <option value="LOW">Thấp (Low)</option>
                        <option value="MEDIUM">Trung Bình (Medium)</option>
                        <option value="HIGH">Cao (High)</option>
                        <option value="URGENT">Khẩn Cấp (Urgent)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Ngày & Giờ Thực Hiện
                    </label>
                    <input
                      type="datetime-local"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="glass-input w-full px-4 py-2.5 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Mô Tả Ghi Chú
                    </label>
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="glass-input w-full px-4 py-2.5 text-sm"
                    ></textarea>
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
                      {editLoading ? 'Đang cập nhật...' : 'Cập Nhật Công Việc'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 3: TASK DETAILS */}
        <AnimatePresence>
          {isDetailModalOpen && selectedTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="glass-card max-w-md w-full p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${getPriorityBadge(
                        selectedTask.priority
                      )}`}
                    >
                      {selectedTask.priority}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                      {selectedTask.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 border-t border-b border-slate-200/50 dark:border-slate-800 py-4 my-4 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Trạng thái:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {selectedTask.status === 'DONE' ? '✓ Đã hoàn thành' : 'Đang thực hiện'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Thời gian thực hiện:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {selectedTask.dueDate
                        ? formatVietnameseDateTime(selectedTask.dueDate)
                        : 'Chưa đặt'}
                    </span>
                  </div>
                  {selectedTask.description && (
                    <div className="pt-2">
                      <span className="font-semibold text-slate-400 block mb-1">Mô tả:</span>
                      <p className="bg-slate-100/50 dark:bg-slate-800/50 p-3 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                        {selectedTask.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteTask()}
                      disabled={actionLoading}
                      className="px-3 py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold rounded-xl text-xs flex items-center gap-1 hover:bg-rose-500/20 transition"
                      title="Xóa task"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(selectedTask)}
                      disabled={actionLoading}
                      className="px-3 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl text-xs flex items-center gap-1 hover:bg-indigo-500/20 transition"
                      title="Sửa task"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Sửa
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleComplete()}
                    disabled={actionLoading}
                    className={`px-4 py-2 text-white font-semibold rounded-xl shadow-lg transition text-xs flex items-center gap-1.5 ${
                      selectedTask.status === 'DONE'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{selectedTask.status === 'DONE' ? 'Chưa Xong' : '✓ Hoàn Thành'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};
