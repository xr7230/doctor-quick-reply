import { Reply, ErrorInfo } from '../types';

interface ReplyResultsProps {
  darkMode: boolean;
  replies: Reply | null;
  error: ErrorInfo | null;
  selectedTab: number;
  onTabChange: (index: number) => void;
  onCopy: (content: string) => void;
  onCopyAll: () => void;
}

const resultTabs = [
  { title: '温暖详细', key: 'versionA' as const },
  { title: '简洁清晰', key: 'versionB' as const },
  { title: '鼓励支持', key: 'versionC' as const },
];

export default function ReplyResults({
  darkMode,
  replies,
  error,
  selectedTab,
  onTabChange,
  onCopy,
  onCopyAll,
}: ReplyResultsProps) {
  if (!replies) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>生成结果</h2>
        <button
          onClick={onCopyAll}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          复制全部
        </button>
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {resultTabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => onTabChange(index)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedTab === index
                ? 'bg-blue-600 text-white'
                : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
        <p className={`whitespace-pre-wrap leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          {replies[resultTabs[selectedTab].key]}
        </p>
        <button
          onClick={() => onCopy(replies[resultTabs[selectedTab].key])}
          className="mt-3 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        >
          复制此版本
        </button>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{error.message}</p>
        </div>
      )}
    </div>
  );
}