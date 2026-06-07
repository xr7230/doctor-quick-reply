// 模型厂商类型
export type ModelVendor = 'DeepSeek' | '智谱GLM' | '阿里云通义' | '自定义';

// 模型配置类型
export interface ModelConfig {
  vendor: ModelVendor;
  apiKey: string;
  baseUrl: string;
  enabled: boolean;
}

// API请求类型
export interface ChatRequest {
  model: string;
  messages: Array<{role: 'system' | 'user', content: string}>;
  temperature?: number;
  max_tokens?: number;
}

// API响应类型
export interface ChatResponse {
  content: string;
  usage?: {prompt_tokens: number, completion_tokens: number};
}

// 错误类型
export type ErrorType = 'network' | 'auth' | 'quota' | 'timeout' | 'unknown';

// 错误信息类型
export interface ErrorInfo {
  type: ErrorType;
  message: string;
}

// 回复类型
export interface Reply {
  versionA: string;
  versionB: string;
  versionC: string;
}

// 场景类型
export type ScenarioType = '安抚' | '告知坏消息' | '处理投诉' | '用药疑问' | '术后焦虑';

// 配置验证状态类型
export type ConfigValidationStatus = 'idle' | 'validating' | 'success' | 'error';

// Banner类型
export type BannerType = 'success' | 'warning' | 'error' | 'info';

// Banner信息接口
export interface BannerInfo {
  type: BannerType;
  message: string;
}

// API模式状态类型
export type ApiModeStatus = 'unconfigured' | 'configuring' | 'error' | 'configured';