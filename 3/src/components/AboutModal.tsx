interface AboutModalProps {
  darkMode: boolean;
  onClose: () => void;
}

export default function AboutModal({ darkMode, onClose }: AboutModalProps) {
  const bg = darkMode ? 'bg-slate-800' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-slate-800';
  const subColor = darkMode ? 'text-slate-300' : 'text-slate-600';
  const dimColor = darkMode ? 'text-slate-400' : 'text-slate-500';
  const borderColor = darkMode ? 'border-slate-700' : 'border-slate-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className={`relative w-full max-w-sm p-6 rounded-2xl ${bg} shadow-xl animate-fade-in`}>
        <h2 className={`text-xl font-bold ${textColor}`}>关于</h2>
        <p className={`mt-4 text-sm ${subColor}`}>
          医患沟通助手 v3.0
        </p>
        <p className={`mt-2 text-xs ${dimColor}`}>
          帮助医生快速生成患者回复建议，提升沟通效率。
        </p>
        <div className={`mt-4 pt-4 border-t ${borderColor}`}>
          <p className={`text-xs ${dimColor}`}>
            模拟模式无需配置，API模式需要配置有效的密钥。
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          知道了
        </button>
      </div>
    </div>
  );
}