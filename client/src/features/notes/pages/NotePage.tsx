import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil, StickyNote, Sparkles, X } from 'lucide-react';
import { MainLayout } from '../../../components/MainLayout';
import api from '../../../services/api';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
}

const COLOR_OPTIONS = [
  { name: 'Mặc định', bg: 'bg-white dark:bg-slate-900', border: 'border-slate-300 dark:border-slate-700', value: 'default' },
  { name: 'Vàng Nắng', bg: 'bg-amber-100 dark:bg-amber-950/70', border: 'border-amber-300 dark:border-amber-800', value: '#fef3c7' },
  { name: 'Xanh Lá', bg: 'bg-emerald-100 dark:bg-emerald-950/70', border: 'border-emerald-300 dark:border-emerald-800', value: '#dcfce7' },
  { name: 'Xanh Dương', bg: 'bg-sky-100 dark:bg-sky-950/70', border: 'border-sky-300 dark:border-sky-800', value: '#e0f2fe' },
  { name: 'Hồng Đào', bg: 'bg-pink-100 dark:bg-pink-950/70', border: 'border-pink-300 dark:border-pink-800', value: '#fce7f3' },
  { name: 'Tím Mộng', bg: 'bg-purple-100 dark:bg-purple-950/70', border: 'border-purple-300 dark:border-purple-800', value: '#f3e8ff' },
];

export const NotePage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('default');
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editNoteId, setEditNoteId] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');
  const [editColor, setEditColor] = useState<string>('default');
  const [editLoading, setEditLoading] = useState<boolean>(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notes');
      if (res.data?.data) {
        setNotes(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách ghi chú', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSubmitLoading(true);
      const res = await api.post('/notes', {
        title: title.trim(),
        content: content.trim(),
        color: selectedColor,
      });

      if (res.data?.data) {
        setNotes((prev) => [res.data.data, ...prev]);
        setTitle('');
        setContent('');
        setSelectedColor('default');
      }
    } catch (err) {
      alert('Thêm ghi chú thất bại!');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleOpenEditModal = (note: Note) => {
    setEditNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content || '');
    setEditColor(note.color || 'default');
    setIsEditModalOpen(true);
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editNoteId) return;

    try {
      setEditLoading(true);
      const res = await api.put(`/notes/${editNoteId}`, {
        title: editTitle.trim(),
        content: editContent.trim(),
        color: editColor,
      });

      if (res.data?.data) {
        const updated = res.data.data;
        setNotes((prev) => prev.map((n) => (n.id === editNoteId ? updated : n)));
        setIsEditModalOpen(false);
      }
    } catch (err) {
      alert('Cập nhật ghi chú thất bại!');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      await api.delete(`/notes/${id}`);
    } catch (err) {
      fetchNotes();
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header Hero Banner */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-white/40 dark:border-slate-800/80">
          <div className="space-y-1 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Google Keep Style
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sổ Tay <span className="text-gradient">Ghi Chú</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Lưu trữ ý tưởng nhanh chóng, sắp xếp màu sắc trực quan và tiện lợi.
            </p>
          </div>
        </div>

        {/* Add New Note Box */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl max-w-2xl mx-auto border border-white/40 dark:border-slate-800/80 shadow-xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-amber-500" />
            <span>Tạo Ghi Chú Mới</span>
          </h2>

          <form onSubmit={handleCreateNote} className="space-y-4">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tiêu đề ghi chú..."
              className="glass-input w-full px-4 py-3 text-base font-extrabold"
            />

            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nội dung ghi chú chi tiết..."
              className="glass-input w-full px-4 py-3 text-sm"
            ></textarea>

            {/* Color Palette Picker */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Tông màu:</span>
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedColor(c.value)}
                    className={`w-7 h-7 rounded-full ${c.bg} ${c.border} border-2 transition transform hover:scale-110 shadow-sm ${
                      selectedColor === c.value ? 'ring-2 ring-indigo-500 scale-110' : ''
                    }`}
                    title={c.name}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={submitLoading || !title.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{submitLoading ? 'Đang lưu...' : 'Lưu Ghi Chú'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Notes Grid Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Danh Sách Ghi Chú</h2>

          {loading ? (
            <div className="py-20 text-center text-slate-400 font-semibold animate-pulse">
              Đang tải danh sách ghi chú...
            </div>
          ) : notes.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-400 rounded-3xl">
              Chưa có ghi chú nào. Hãy tạo ghi chú đầu tiên ở trên!
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {notes.map((note) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="glass-card p-6 rounded-3xl border border-white/40 dark:border-slate-800/80 shadow-md flex flex-col justify-between group relative overflow-hidden transition-all duration-300"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug break-words">
                          {note.title}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(note)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                            title="Sửa ghi chú"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Xóa ghi chú"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap break-words">
                        {note.content}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/60 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                      <span>{new Date(note.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Modal Edit Note */}
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
                    <span>Chỉnh Sửa Ghi Chú</span>
                  </h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateNote} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Tiêu Đề Ghi Chú
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="glass-input w-full px-4 py-2.5 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Nội Dung Ghi Chú
                    </label>
                    <textarea
                      rows={4}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="glass-input w-full px-4 py-2.5 text-sm"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Tông Màu
                    </label>
                    <div className="flex items-center space-x-2 pt-1">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setEditColor(c.value)}
                          className={`w-7 h-7 rounded-full ${c.bg} ${c.border} border-2 transition transform hover:scale-110 shadow-sm ${
                            editColor === c.value ? 'ring-2 ring-indigo-500 scale-110' : ''
                          }`}
                          title={c.name}
                        />
                      ))}
                    </div>
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
                      {editLoading ? 'Đang cập nhật...' : 'Cập Nhật Ghi Chú'}
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
