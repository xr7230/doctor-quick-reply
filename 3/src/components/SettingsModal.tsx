import { useState } from 'react';
import { ModelConfig, ConfigValidationStatus } from '../types';

interface SettingsModalProps {
  darkMode: boolean;
  show: boolean;
  config: ModelConfig;
  isApiMode: boolean;
  validationStatus: ConfigValidationStatus;
  validationMessage: string;
  validationDetails: { url?: string; statusCode?: number; errorType?: string; hint?: string } | null;
  isTesting: boolean;
  onClose: () => void;
  onTestConnection: (tempConfig: ModelConfig) => Promise<void>;
  onSaveConfig: (tempConfig: ModelConfig) => void;
  onDisableApi: () => void;
  onEnableApi: () => void;
  onClearConfig: () => void;
  onResetValidation: () => void;
  onGetCurlCommand: (baseUrl: string, apiKey: string) => string;
}

export default function SettingsModal({
  darkMode, show, config, isApiMode,
  validationStatus, validationMessage, validationDetails, isTesting,
  onClose, onTestConnection, onSaveConfig,
  onDisableApi, onEnableApi, onClearConfig,
  onResetValidation, onGetCurlCommand,
}: SettingsModalProps) {
  const [tempConfig, setTempConfig] = useState<ModelConfig>(config);
  const [showCurl, setShowCurl] = useState(false);

  if (!show) return null;

  const bg = darkMode ? 'bg-slate-800' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700' : 'border-slate-200';
  const inputBg = darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300';
  const labelColor = darkMode ? 'text-slate-300' : 'text-slate-700';
  const dimColor = darkMode ? 'text-slate-400' : 'text-slate-500';

  const handleVendorChange = (vendor: ModelConfig['vendor']) => {
    setTempConfig({ ...tempConfig, vendor });
    onResetValidation();
  };
  const handleKeyChange = (key: string) => {
    setTempConfig({ ...tempConfig, apiKey: key });
    onResetValidation();
  };
  const handleUrlChange = (url: string) => {
    setTempConfig({ ...tempConfig, baseUrl: url });
    onResetValidation();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div onClick={onClose} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div className={`relative w-full max-w-sm ml-auto h-full overflow-y-auto ${bg} shadow-xl animate-slide-in`}>
        <div className={`sticky top-0 flex items-center justify-between p-4 border-b ${borderColor} ${bg}`}>
          <div>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>模型配置</h2>
            <p className={`text-xs mt-0.5 ${dimColor}`}>
              {isApiMode ? `已配置（${config.vendor}）` : '未配置'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className={`block text-sm font-medium ${labelColor} mb-1.5`}>模型厂商</label>
            <select value={tempConfig.vendor} onChange={(e) => handleVendorChange(e.target.value as ModelConfig['vendor'])}
              className={`w-full px-3 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}>
              <option value="DeepSeek">DeepSeek</option>
              <option value="智谱GLM">智谱GLM</option>
              <option value="阿里云通义">阿里云通义</option>
              <option value="自定义">自定义</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${labelColor} mb-1.5`}>API密钥</label>
            <input type="password" value={tempConfig.apiKey} onChange={(e) => handleKeyChange(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="sk-xxxxxxxxxxxxxxxx" />
          </div>
          <div>
            <label className={`block text-sm font-medium ${labelColor} mb-1.5`}>Base URL</label>
            <input type="text" value={tempConfig.baseUrl} onChange={(e) => handleUrlChange(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="https://api.deepseek.com/v1" />
            <p className={`mt-1.5 text-xs ${dimColor}`}>
              DeepSeek: https://api.deepseek.com/v1<br />
              智谱GLM: https://open.bigmodel.cn/api/paas/v4
            </p>
          </div>

          <div className="space-y-2">
            <button onClick={() => onTestConnection(tempConfig)} disabled={isTesting}
              className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${isTesting ? 'bg-slate-200 text-slate-500' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {isTesting ? (<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>测试中...</>) : '测试连接'}
            </button>

            <button onClick={() => setShowCurl(!showCurl)}
              className="w-full py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              {showCurl ? '隐藏' : '显示'} curl 命令
            </button>

            {showCurl && tempConfig.apiKey && tempConfig.baseUrl && (
              <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                {onGetCurlCommand(tempConfig.baseUrl, tempConfig.apiKey)}
              </pre>
            )}

            {validationMessage && (
              <div className={`p-3 rounded-lg text-sm ${validationStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : validationStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-50 text-slate-600'}`}>
                <p className="font-medium">{validationMessage}</p>
                {validationDetails?.hint && <p className="mt-1 text-xs opacity-80">{validationDetails.hint}</p>}
              </div>
            )}

            <button onClick={() => onSaveConfig(tempConfig)} disabled={validationStatus !== 'success'}
              className={`w-full py-2.5 rounded-lg font-medium transition-colors ${validationStatus === 'success' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400'}`}>
              保存配置
            </button>

            {isApiMode && (
              <button onClick={() => { onDisableApi(); onClose(); }}
                className="w-full py-2.5 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                切换到模拟模式
              </button>
            )}
            {!isApiMode && config.apiKey && (
              <button onClick={() => { onEnableApi(); onClose(); }}
                className="w-full py-2.5 rounded-lg font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                启用API模式
              </button>
            )}
            <button onClick={() => { onClearConfig(); }}
              className="w-full py-2.5 rounded-lg font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              清除配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}