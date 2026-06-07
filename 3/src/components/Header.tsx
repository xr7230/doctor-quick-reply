interface HeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
  onToggleSidebar: () => void;
  onShowHistory: () => void;
  onShowTemplates: () => void;
  onOpenSettings: () => void;
  onToggleQuickReplies: () => void;
  isApiMode: boolean;
  apiModeStatus: string;
  configVendor: string;
}

export default function Header({
  darkMode,
  onToggleDark,
  onToggleSidebar,
  onShowHistory,
  onShowTemplates,
  onOpenSettings,
  onToggleQuickReplies,
  isApiMode,
  apiModeStatus,
  configVendor,
}: HeaderProps) {
  const headerBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const textColor = darkMode ? 'text-white' : 'text-slate-800';
  const hoverBg = darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100';
  const iconBg = darkMode ? 'bg-slate-700 text-yellow-400' : 'bg-slate-100 text-slate-600';

  return (
    <header className={`fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 md:px-6 z-50 transition-colors ${headerBg} border-b`}>
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className={`p-2 rounded-lg transition-colors ${hoverBg}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className={`text-lg md:text-xl font-semibold ${textColor}`}>
          医患沟通助手 <span className="text-xs font-normal text-slate-400">v3.0</span>
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {isApiMode && apiModeStatus === 'configured' && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            {configVendor}
          </span>
        )}

        <button onClick={onToggleDark} className={`p-2 rounded-lg transition-colors ${iconBg}`}>
          {darkMode ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <button onClick={onShowHistory} className={`p-2 rounded-lg transition-colors ${hoverBg}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <button onClick={onShowTemplates} className={`p-2 rounded-lg transition-colors ${hoverBg}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>

        <button onClick={onToggleQuickReplies} className={`p-2 rounded-lg transition-colors ${hoverBg}`} title="快捷回复">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>

        <button onClick={onOpenSettings} className={`p-2 rounded-lg transition-colors ${hoverBg}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
}