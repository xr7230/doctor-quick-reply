import { useState, useEffect, useCallback } from 'react';
import { QuickReply, getAll, getCategories, remove, add, ensureDefaults } from '../utils/quickReplies';

interface Props {
  darkMode: boolean;
  show: boolean;
  onClose: () => void;
  onCopy: (content: string) => void;
}

export default function QuickReplyPanel({ darkMode, show, onClose, onCopy }: Props) {
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCat, setActiveCat] = useState('');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    ensureDefaults();
    setReplies(getAll());
    setCategories(getCategories());
  }, [show]);

  const filtered = replies.filter(r => {
    if (activeCat && r.category !== activeCat) return false;
    if (search && !r.content.includes(search) && !r.category.includes(search)) return false;
    return true;
  });

  const handleDelete = useCallback((id: string) => {
    setReplies(remove(id));
  }, []);

  const handleAdd = useCallback(() => {
    if (!newContent.trim()) return;
    const cat = newCategory.trim() || (categories[0] || '其他');
    const updated = add({ content: newContent.trim(), category: cat });
    setReplies(updated);
    setNewContent('');
    setNewCategory('');
    setShowAdd(false);
  }, [newContent, newCategory, categories]);

  if (!show) return null;

  const overlayBg = darkMode ? 'bg-slate-900' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-slate-800';
  const subColor = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800' : 'bg-slate-50';
  const borderColor = darkMode ? 'border-slate-700' : 'border-slate-200';
  const inputBg = darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200';

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
      <div className={`fixed top-0 right-0 w-full max-w-sm h-full z-50 overflow-y-auto ${overlayBg} shadow-xl`}>
        <div className={`sticky top-0 z-10 ${overlayBg} border-b ${borderColor}`}>
          <div className="flex items-center justify-between p-4">
            <h2 className={`text-lg font-semibold ${textColor}`}>快捷回复</h2>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(!showAdd)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {showAdd && (
            <div className="px-4 pb-3 space-y-2">
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`}
              >
                <option value="">选择分类</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea
                placeholder="输入回复模板..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border text-sm resize-none ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button onClick={handleAdd} className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">添加</button>
            </div>
          )}

          <div className="px-4 pb-2">
            <input
              type="text"
              placeholder="搜索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div className="flex gap-1 px-4 pb-3 overflow-x-auto">
            <button onClick={() => setActiveCat('')} className={`shrink-0 px-3 py-1 rounded-full text-xs ${!activeCat ? 'bg-blue-600 text-white' : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>全部</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat === activeCat ? '' : cat)} className={`shrink-0 px-3 py-1 rounded-full text-xs ${cat === activeCat ? 'bg-blue-600 text-white' : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>{cat}</button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {filtered.length === 0 && <p className={`text-sm text-center py-8 ${subColor}`}>没有匹配的模板</p>}
          {filtered.map(reply => (
            <div key={reply.id} className={`p-3 rounded-xl ${cardBg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">{reply.category}</span>
                <button onClick={() => handleDelete(reply.id)} className="text-xs text-red-500 hover:underline">删除</button>
              </div>
              <p className={`text-sm mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{reply.content}</p>
              <button onClick={() => onCopy(reply.content)} className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">复制</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}