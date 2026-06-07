import { Template } from '../utils/db';

interface TemplatePanelProps {
  darkMode: boolean;
  show: boolean;
  templates: Template[];
  onClose: () => void;
  onLoad: (template: Template) => void;
  onDelete: (id: string) => void;
}

export default function TemplatePanel({
  darkMode,
  show,
  templates,
  onClose,
  onLoad,
  onDelete,
}: TemplatePanelProps) {
  if (!show) return null;

  const overlayBg = darkMode ? 'bg-slate-900' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-slate-800';
  const subColor = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800' : 'bg-slate-50';
  const borderColor = darkMode ? 'border-slate-700' : 'border-slate-200';

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
      <div className={`fixed top-0 left-0 w-full max-w-xs h-full z-50 overflow-y-auto ${overlayBg} shadow-xl animate-slide-in`}>
        <div className={`sticky top-0 flex items-center justify-between p-4 border-b ${borderColor} ${overlayBg}`}>
          <h2 className={`text-lg font-semibold ${textColor}`}>模板收藏</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-4 space-y-3">
          {templates.length === 0 && (
            <p className={`text-sm text-center py-8 ${subColor}`}>暂无模板，输入内容后点击"保存模板"</p>
          )}
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => onLoad(template)}
              className={`p-3 rounded-xl ${cardBg} cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-medium ${textColor}`}>{template.name}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(template.id); }}
                  className="text-xs text-red-500 shrink-0 hover:underline"
                >
                  删除
                </button>
              </div>
              <p className={`text-sm line-clamp-2 mt-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{template.doctorInput}</p>
              <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${darkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>{template.scenarioType}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}