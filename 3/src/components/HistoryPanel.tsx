import { HistoryRecord } from '../utils/db';

interface HistoryPanelProps {
  darkMode: boolean;
  show: boolean;
  history: HistoryRecord[];
  onClose: () => void;
  onLoad: (record: HistoryRecord) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function HistoryPanel({
  darkMode,
  show,
  history,
  onClose,
  onLoad,
  onDelete,
  onClearAll,
}: HistoryPanelProps) {
  if (!show) return null;

  const overlayBg = darkMode ? 'bg-slate-900' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-slate-800';
  const subColor = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800' : 'bg-slate-50';
  const borderColor = darkMode ? 'border-slate-700' : 'border-slate-200';

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
      <div className={`fixed top-0 left-0 w-full max-w-xs h-full z-50 overflow-y-auto ${overlayBg} shadow-xl animate-slide-in`}>
        <div className={`sticky top-0 flex items-center justify-between p-4 border-b ${borderColor} ${overlayBg}`}>
          <h2 className={`text-lg font-semibold ${textColor}`}>历史记录</h2>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button onClick={onClearAll} className="text-xs text-red-500 hover:underline">清空</button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {history.length === 0 && (
            <p className={`text-sm text-center py-8 ${subColor}`}>暂无记录</p>
          )}
          {history.map((record) => (
            <div
              key={record.id}
              onClick={() => onLoad(record)}
              className={`p-3 rounded-xl ${cardBg} cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-medium line-clamp-2 ${textColor}`}>{record.doctorInput}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(record.id); }}
                  className="text-xs text-red-500 shrink-0 hover:underline"
                >
                  删除
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                  {record.scenarioType}
                </span>
                <span className={`text-xs ${subColor}`}>{formatTime(record.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}