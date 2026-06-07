import { useState, useCallback, useEffect } from 'react';
import { useModelConfig } from './hooks/useModelConfig';
import { callChatAPI, testConnection, getCurlCommand } from './api';
import { generateSystemPrompt, generateUserPrompt, parseApiResponse, filterDangerousContent } from './utils/prompt';
import { generateMockReply } from './utils/mockReply';
import { loadHistory, saveToHistory, deleteHistoryItem, clearAllHistory, loadTemplates, saveTemplate, deleteTemplateItem } from './utils/db';
import type { HistoryRecord, Template } from './utils/db';
import { ModelConfig, ScenarioType, Reply, ErrorInfo, ConfigValidationStatus } from './types';
import Header from './components/Header';
import Banner from './components/Banner';
import HistoryPanel from './components/HistoryPanel';
import TemplatePanel from './components/TemplatePanel';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';
import Toast from './components/Toast';
import InputForm from './components/InputForm';
import ReplyResults from './components/ReplyResults';
import QuickReplyPanel from './components/QuickReplyPanel';

function App() {
  const {
    config,
    saveConfig,
    clearConfig,
    apiModeStatus,
    setApiModeStatus,
    banner,
    showBanner,
    apiModeEnabled,
    disableApiMode,
    enableApiMode
  } = useModelConfig();

  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [doctorInput, setDoctorInput] = useState('');
  const [scenarioType, setScenarioType] = useState<ScenarioType>('安抚');
  const [patientBackgroundMode, setPatientBackgroundMode] = useState<'natural' | 'structured'>('natural');
  const [patientContext, setPatientContext] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientCondition, setPatientCondition] = useState('');
  const [patientEmotion, setPatientEmotion] = useState('');
  const [replies, setReplies] = useState<Reply | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [copySuccess, setCopySuccess] = useState('');

  const [validationStatus, setValidationStatus] = useState<ConfigValidationStatus>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [validationDetails, setValidationDetails] = useState<{
    url?: string;
    statusCode?: number;
    errorType?: string;
    hint?: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedResultTab, setSelectedResultTab] = useState(0);
  const [showAbout, setShowAbout] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    (async () => {
      try {
        const h = await loadHistory();
        setHistory(h);
        const t = await loadTemplates();
        setTemplates(t);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    })();
  }, []);

  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopySuccess('复制成功！');
      setTimeout(() => setCopySuccess(''), 2000);
    }).catch(() => {
      setCopySuccess('复制失败');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  }, []);

  const handleCopyAll = useCallback(() => {
    if (!replies) return;
    const formatted = `【版本A：温暖详细】\n${replies.versionA}\n\n【版本B：简洁清晰】\n${replies.versionB}\n\n【版本C：鼓励支持】\n${replies.versionC}`;
    navigator.clipboard.writeText(formatted).then(() => {
      setCopySuccess('全部已复制！');
      setTimeout(() => setCopySuccess(''), 2000);
    }).catch(() => {
      setCopySuccess('复制失败');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  }, [replies]);

  const getPatientBackground = useCallback(() => {
    if (patientBackgroundMode === 'natural') return patientContext;
    const parts = [];
    if (patientAge) parts.push(`年龄: ${patientAge}`);
    if (patientGender) parts.push(`性别: ${patientGender}`);
    if (patientCondition) parts.push(`病情: ${patientCondition}`);
    if (patientEmotion) parts.push(`情绪: ${patientEmotion}`);
    return parts.join(', ');
  }, [patientBackgroundMode, patientContext, patientAge, patientGender, patientCondition, patientEmotion]);

  const handleGenerate = useCallback(async () => {
    if (!doctorInput.trim()) {
      setError({ type: 'unknown', message: '请输入医生回复要点' });
      return;
    }

    setIsGenerating(true);
    setError(null);
    setReplies(null);
    setSelectedResultTab(0);

    try {
      const fullPatientContext = getPatientBackground();
      const useApiMode = apiModeEnabled && config.apiKey && config.enabled;

      if (!useApiMode) {
        const mockReplies = generateMockReply(scenarioType, doctorInput, fullPatientContext);
        setReplies(mockReplies);
        const updatedHistory = await saveToHistory({
          doctorInput, patientContext: fullPatientContext, scenarioType, replies: mockReplies, mode: 'mock'
        });
        setHistory(updatedHistory);
        return;
      }

      const request = {
        model: '',
        messages: [
          { role: 'system' as const, content: generateSystemPrompt() },
          { role: 'user' as const, content: generateUserPrompt(doctorInput, fullPatientContext, scenarioType) },
        ],
        temperature: 0.5,
        max_tokens: 600,
      };

      const response = await callChatAPI(config, request);
      const parsed = parseApiResponse(response.content);

      if (!parsed) {
        setError({ type: 'unknown', message: '生成异常，请重试' });
        return;
      }

      // 安全过滤
      const filteredA = filterDangerousContent(parsed.versionA);
      const filteredB = filterDangerousContent(parsed.versionB);
      const filteredC = filterDangerousContent(parsed.versionC);
      const safeReplies = { versionA: filteredA.filtered, versionB: filteredB.filtered, versionC: filteredC.filtered };
      setReplies(safeReplies);
      const updatedHistory = await saveToHistory({
        doctorInput, patientContext: fullPatientContext, scenarioType, replies: safeReplies, mode: 'api'
      });
      setHistory(updatedHistory);
    } catch (err: any) {
      if (err?.type === 'auth' || err?.message?.includes('密钥') || err?.message?.includes('认证')) {
        setApiModeStatus('error');
        disableApiMode();
        showBanner({ type: 'error', message: 'API密钥失效，已切换到模拟模式' });
      } else {
        setError(err as ErrorInfo);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [doctorInput, scenarioType, config, apiModeEnabled, getPatientBackground, setApiModeStatus, disableApiMode, showBanner]);

  const handleSaveTemplate = useCallback(async () => {
    if (!doctorInput.trim()) {
      showBanner({ type: 'error', message: '请先输入医生回复要点' });
      return;
    }
    const name = prompt('请输入模板名称：');
    if (!name) return;
    try {
      const updated = await saveTemplate({ name, doctorInput, patientContext, scenarioType });
      setTemplates(updated);
      showBanner({ type: 'success', message: '模板已保存' });
    } catch (err) {
      console.error('Failed to save template:', err);
    }
  }, [doctorInput, patientContext, scenarioType, showBanner]);

  const handleLoadTemplate = useCallback((template: Template) => {
    setDoctorInput(template.doctorInput);
    setPatientContext(template.patientContext);
    setScenarioType(template.scenarioType);
    setShowTemplates(false);
    showBanner({ type: 'info', message: `已加载模板：${template.name}` });
  }, [showBanner]);

  const handleDeleteTemplate = useCallback(async (id: string) => {
    const updated = await deleteTemplateItem(id);
    setTemplates(updated);
  }, []);

  const handleDeleteHistory = useCallback(async (id: string) => {
    const updated = await deleteHistoryItem(id);
    setHistory(updated);
  }, []);

  const handleClearHistory = useCallback(async () => {
    await clearAllHistory();
    setHistory([]);
  }, []);

  const handleLoadFromHistory = useCallback((record: HistoryRecord) => {
    setDoctorInput(record.doctorInput);
    setPatientContext(record.patientContext);
    setScenarioType(record.scenarioType);
    setReplies(record.replies);
    setShowHistory(false);
  }, []);

  const handleShowMock = useCallback(() => {
    const mockReplies = generateMockReply(scenarioType, doctorInput, getPatientBackground());
    setReplies(mockReplies);
    setSelectedResultTab(0);
  }, [scenarioType, doctorInput, getPatientBackground]);

  const openSettings = useCallback(() => {
    setValidationStatus('idle');
    setValidationMessage('');
    setValidationDetails(null);
    setShowSettings(true);
  }, []);

  const handleTestConnection = useCallback(async (tempConfig: ModelConfig) => {
    if (!tempConfig.apiKey || !tempConfig.baseUrl) {
      setValidationStatus('error');
      setValidationMessage('请输入API密钥和Base URL');
      setValidationDetails({ hint: '请填写API密钥和服务器地址后重试' });
      return;
    }

    setIsTesting(true);
    setValidationStatus('validating');
    setValidationMessage('正在测试连接...');
    setValidationDetails(null);

    try {
      const result = await testConnection(tempConfig.baseUrl, tempConfig.apiKey, tempConfig.vendor);
      if (result.success) {
        setValidationStatus('success');
        setValidationMessage(result.message);
        setValidationDetails(result.details || null);
      } else {
        setValidationStatus('error');
        setValidationMessage(result.message);
        setValidationDetails(result.details || null);
      }
    } catch (err: any) {
      setValidationStatus('error');
      setValidationMessage(err?.message || '测试连接失败');
    } finally {
      setIsTesting(false);
    }
  }, []);

  const handleSaveConfig = useCallback((tempConfig: ModelConfig) => {
    const newConfig = { ...tempConfig, enabled: true };
    saveConfig(newConfig);
    setShowSettings(false);
    showBanner({ type: 'success', message: `已切换到API模式（${tempConfig.vendor}），模拟数据已关闭` });
    setApiModeStatus('configured');
    setValidationStatus('idle');
    setValidationMessage('');
  }, [saveConfig, showBanner, setApiModeStatus]);

  const handleResetValidation = useCallback(() => {
    if (validationStatus !== 'idle') {
      setValidationStatus('idle');
      setValidationMessage('');
      setValidationDetails(null);
    }
  }, [validationStatus]);

  const isApiMode = !!(apiModeEnabled && config.apiKey && config.enabled);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <Header
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(!darkMode)}
        onToggleSidebar={() => { setDoctorInput(''); setPatientContext(''); setPatientAge(''); setPatientGender(''); setPatientCondition(''); setPatientEmotion(''); setReplies(null); setError(null); }}
        onShowHistory={() => setShowHistory(!showHistory)}
        onShowTemplates={() => setShowTemplates(!showTemplates)}
        onOpenSettings={openSettings}
        onToggleQuickReplies={() => setShowQuickReplies(!showQuickReplies)}
        isApiMode={isApiMode}
        apiModeStatus={apiModeStatus}
        configVendor={config.vendor}
      />

      <Banner banner={banner} />

      <HistoryPanel
        darkMode={darkMode}
        show={showHistory}
        history={history}
        onClose={() => setShowHistory(false)}
        onLoad={handleLoadFromHistory}
        onDelete={handleDeleteHistory}
        onClearAll={handleClearHistory}
      />

      <TemplatePanel
        darkMode={darkMode}
        show={showTemplates}
        templates={templates}
        onClose={() => setShowTemplates(false)}
        onLoad={handleLoadTemplate}
        onDelete={handleDeleteTemplate}
      />

      <SettingsModal
        darkMode={darkMode}
        show={showSettings}
        config={config}
        isApiMode={isApiMode}
        validationStatus={validationStatus}
        validationMessage={validationMessage}
        validationDetails={validationDetails}
        isTesting={isTesting}
        onClose={() => setShowSettings(false)}
        onTestConnection={handleTestConnection}
        onSaveConfig={handleSaveConfig}
        onDisableApi={() => { disableApiMode(); showBanner({ type: 'info', message: '已切换到模拟模式' }); }}
        onEnableApi={() => { enableApiMode(); showBanner({ type: 'info', message: `已启用${config.vendor}` }); }}
        onClearConfig={() => { clearConfig(); showBanner({ type: 'info', message: '配置已清除' }); }}
        onResetValidation={handleResetValidation}
        onGetCurlCommand={getCurlCommand}
      />

      <QuickReplyPanel darkMode={darkMode} show={showQuickReplies} onClose={() => setShowQuickReplies(false)} onCopy={handleCopy} />

      {showAbout && (
        <AboutModal darkMode={darkMode} onClose={() => setShowAbout(false)} />
      )}

      <main className="pt-20 pb-20 px-4 md:px-6 max-w-2xl mx-auto">
        <InputForm
          darkMode={darkMode}
          doctorInput={doctorInput}
          scenarioType={scenarioType}
          patientBackgroundMode={patientBackgroundMode}
          patientContext={patientContext}
          patientAge={patientAge}
          patientGender={patientGender}
          patientCondition={patientCondition}
          patientEmotion={patientEmotion}
          isGenerating={isGenerating}
          isApiMode={isApiMode}
          apiModeStatus={apiModeStatus}
          configVendor={config.vendor}
          onDoctorInputChange={setDoctorInput}
          onScenarioChange={setScenarioType}
          onModeChange={setPatientBackgroundMode}
          onPatientContextChange={setPatientContext}
          onPatientAgeChange={setPatientAge}
          onPatientGenderChange={setPatientGender}
          onPatientConditionChange={setPatientCondition}
          onPatientEmotionChange={setPatientEmotion}
          onGenerate={handleGenerate}
          onSaveTemplate={handleSaveTemplate}
          onShowMock={handleShowMock}
        />

        <div className="mt-6">
          <ReplyResults
            darkMode={darkMode}
            replies={replies}
            error={error}
            selectedTab={selectedResultTab}
            onTabChange={setSelectedResultTab}
            onCopy={handleCopy}
            onCopyAll={handleCopyAll}
          />
        </div>
      </main>

      <Toast message={copySuccess} />

      <footer className={`py-4 text-center border-t ${darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'} text-xs`}>
        <p>医患沟通助手 v3.0 &copy; {new Date().getFullYear()}</p>
        <button onClick={() => setShowAbout(true)} className="mt-1 hover:underline">关于</button>
      </footer>
    </div>
  );
}

export default App;