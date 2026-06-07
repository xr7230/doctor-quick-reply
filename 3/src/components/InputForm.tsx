import { ScenarioType } from '../types';

interface InputFormProps {
  darkMode: boolean;
  doctorInput: string;
  scenarioType: ScenarioType;
  patientBackgroundMode: 'natural' | 'structured';
  patientContext: string;
  patientAge: string;
  patientGender: string;
  patientCondition: string;
  patientEmotion: string;
  isGenerating: boolean;
  isApiMode: boolean;
  apiModeStatus: string;
  configVendor: string;
  onDoctorInputChange: (val: string) => void;
  onScenarioChange: (val: ScenarioType) => void;
  onModeChange: (mode: 'natural' | 'structured') => void;
  onPatientContextChange: (val: string) => void;
  onPatientAgeChange: (val: string) => void;
  onPatientGenderChange: (val: string) => void;
  onPatientConditionChange: (val: string) => void;
  onPatientEmotionChange: (val: string) => void;
  onGenerate: () => void;
  onSaveTemplate: () => void;
  onShowMock: () => void;
}

const scenarios: ScenarioType[] = ['安抚', '告知坏消息', '处理投诉', '用药疑问', '术后焦虑'];

export default function InputForm({
  darkMode,
  doctorInput,
  scenarioType,
  patientBackgroundMode,
  patientContext,
  patientAge,
  patientGender,
  patientCondition,
  patientEmotion,
  isGenerating,
  isApiMode,
  apiModeStatus,
  configVendor,
  onDoctorInputChange,
  onScenarioChange,
  onModeChange,
  onPatientContextChange,
  onPatientAgeChange,
  onPatientGenderChange,
  onPatientConditionChange,
  onPatientEmotionChange,
  onGenerate,
  onSaveTemplate,
  onShowMock,
}: InputFormProps) {
  const cardBg = darkMode ? 'bg-slate-800' : 'bg-white';
  const labelColor = darkMode ? 'text-slate-300' : 'text-slate-700';
  const inputBg = darkMode ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500' : 'bg-slate-50 border-slate-200 placeholder-slate-400';

  return (
    <div className={`p-4 md:p-6 rounded-2xl ${cardBg} shadow-sm`}>
      <div>
        <label className={`block text-sm font-medium ${labelColor} mb-2`}>医生输入</label>
        <textarea
          value={doctorInput}
          onChange={(e) => onDoctorInputChange(e.target.value)}
          placeholder="例如：您这次检查显示恢复得不错，我建议继续目前的治疗方案，再进行两周的治疗。"
          className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y`}
          rows={4}
        />
      </div>

      <div className="mt-4">
        <label className={`block text-sm font-medium ${labelColor} mb-2`}>场景类型</label>
        <div className="flex flex-wrap gap-2">
          {scenarios.map((scenario) => (
            <button
              key={scenario}
              onClick={() => onScenarioChange(scenario)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                scenarioType === scenario
                  ? 'bg-blue-600 text-white'
                  : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {scenario}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <label className={`text-sm font-medium ${labelColor}`}>患者背景</label>
          <div className="flex gap-1">
            <button
              onClick={() => onModeChange('natural')}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                patientBackgroundMode === 'natural'
                  ? 'bg-blue-600 text-white'
                  : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
              }`}
            >
              自然语言
            </button>
            <button
              onClick={() => onModeChange('structured')}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                patientBackgroundMode === 'structured'
                  ? 'bg-blue-600 text-white'
                  : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
              }`}
            >
              结构化
            </button>
          </div>
        </div>

        {patientBackgroundMode === 'natural' ? (
          <textarea
            value={patientContext}
            onChange={(e) => onPatientContextChange(e.target.value)}
            placeholder="例如：患者是35岁的女性，患有高血压和糖尿病..."
            className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-y`}
            rows={2}
          />
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              value={patientAge}
              onChange={(e) => onPatientAgeChange(e.target.value)}
              placeholder="年龄，例如 35岁"
              className={`w-full px-3 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <input
              type="text"
              value={patientGender}
              onChange={(e) => onPatientGenderChange(e.target.value)}
              placeholder="性别，例如 女"
              className={`w-full px-3 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <input
              type="text"
              value={patientCondition}
              onChange={(e) => onPatientConditionChange(e.target.value)}
              placeholder="病情，例如 高血压"
              className={`w-full px-3 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <input
              type="text"
              value={patientEmotion}
              onChange={(e) => onPatientEmotionChange(e.target.value)}
              placeholder="情绪，例如 担心"
              className={`w-full px-3 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-white ${
            isGenerating ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              生成中...
            </>
          ) : isApiMode ? `生成回复（${configVendor}）` : '生成回复（模拟）'}
        </button>
        <button
          onClick={onSaveTemplate}
          className={`px-4 py-3 rounded-xl font-medium transition-colors ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          保存模板
        </button>
      </div>

      {isApiMode && apiModeStatus === 'configured' ? (
        <p className="mt-2 text-sm text-emerald-600 text-center flex items-center justify-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          当前使用{configVendor} API
        </p>
      ) : apiModeStatus === 'error' ? (
        <p className="mt-2 text-sm text-amber-600 text-center">配置验证失败，使用模拟数据</p>
      ) : (
        <p className="mt-2 text-sm text-slate-500 text-center">当前使用模拟数据</p>
      )}

      <button
        onClick={onShowMock}
        className={`mt-2 w-full py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
      >
        显示模拟数据
      </button>
    </div>
  );
}