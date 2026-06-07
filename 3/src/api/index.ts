import { ChatRequest, ChatResponse, ModelConfig } from '../types';
import { deepseekAdapter } from './adapters/base';
import { glmAdapter } from './adapters/base';
import { qwenAdapter } from './adapters/base';
import { customAdapter } from './adapters/base';

export const callChatAPI = async (
  config: ModelConfig,
  request: ChatRequest
): Promise<ChatResponse> => {
  if (!config.enabled) {
    throw {
      type: 'auth' as const,
      message: 'AI功能未启用，请先配置API密钥',
    };
  }

  if (!config.apiKey) {
    throw {
      type: 'auth' as const,
      message: 'API密钥为空，请输入API密钥',
    };
  }

  if (!config.baseUrl) {
    throw {
      type: 'auth' as const,
      message: 'Base URL为空，请输入API基础地址',
    };
  }

  try {
    // 设置30秒超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response: ChatResponse;

    switch (config.vendor) {
      case 'DeepSeek':
        response = await deepseekAdapter(config.baseUrl, config.apiKey, request);
        break;
      case '智谱GLM':
        response = await glmAdapter(config.baseUrl, config.apiKey, request);
        break;
      case '阿里云通义':
        response = await qwenAdapter(config.baseUrl, config.apiKey, request);
        break;
      case '自定义':
        response = await customAdapter(config.baseUrl, config.apiKey, request);
        break;
      default:
        throw {
          type: 'unknown' as const,
          message: '不支持的模型厂商',
        };
    }

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw {
        type: 'timeout' as const,
        message: '请求超时，请重试',
      };
    }

    throw error;
  }
};

export interface TestConnectionResult {
  success: boolean;
  message: string;
  details?: {
    url?: string;
    statusCode?: number;
    errorType?: 'network' | 'format' | 'auth' | 'quota' | 'timeout' | 'cors' | 'server' | 'unknown';
    rawError?: string;
    hint?: string;
  };
}

export const testConnection = async (
  baseUrl: string,
  apiKey: string,
  vendor: string
): Promise<TestConnectionResult> => {
  if (!apiKey || apiKey.trim() === '') {
    return {
      success: false,
      message: 'API密钥不能为空',
      details: {
        errorType: 'format',
        hint: '请输入您的API密钥，例如：sk-xxxxxxxxxxxxxxxx'
      }
    };
  }

  if (!apiKey.startsWith('sk-')) {
    return {
      success: false,
      message: 'API密钥格式错误，应以sk-开头',
      details: {
        errorType: 'format',
        hint: 'DeepSeek/OpenAI兼容的API密钥通常以 sk- 开头'
      }
    };
  }

  if (apiKey.length < 20) {
    return {
      success: false,
      message: 'API密钥长度不足，请检查是否输入正确',
      details: {
        errorType: 'format',
        hint: 'API密钥通常长度在40-80个字符之间'
      }
    };
  }

  if (!baseUrl || baseUrl.trim() === '') {
    return {
      success: false,
      message: 'Base URL不能为空',
      details: {
        errorType: 'format',
        hint: '请输入API服务地址'
      }
    };
  }

  if (!baseUrl.startsWith('http')) {
    return {
      success: false,
      message: 'Base URL格式错误，应以http或https开头',
      details: {
        errorType: 'format',
        hint: 'API地址通常以 https:// 开头'
      }
    };
  }

  const testUrl = baseUrl.replace(/\/$/, '') + '/chat/completions';
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 15000);

    switch (vendor) {
      case 'DeepSeek':
        await deepseekAdapter(baseUrl, apiKey, {
          model: 'deepseek-chat',
          messages: [{ role: 'user' as const, content: 'Hi' }],
          max_tokens: 5,
        });
        break;
      case '智谱GLM':
        await glmAdapter(baseUrl, apiKey, {
          model: 'glm-4',
          messages: [{ role: 'user' as const, content: 'Hi' }],
          max_tokens: 5,
        });
        break;
      case '阿里云通义':
        await qwenAdapter(baseUrl, apiKey, {
          model: 'qwen-turbo',
          messages: [{ role: 'user' as const, content: 'Hi' }],
          max_tokens: 5,
        });
        break;
      default:
        await customAdapter(baseUrl, apiKey, {
          model: '',
          messages: [{ role: 'user' as const, content: 'Hi' }],
          max_tokens: 5,
        });
    }

    if (timeoutId) clearTimeout(timeoutId);
    return {
      success: true,
      message: '连接成功！API密钥有效',
      details: {
        url: testUrl,
        hint: '密钥仅本地存储，测试请求直接发送到服务器'
      }
    };
  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId);

    if (error?.type === 'auth' || error?.status === 401) {
      return {
        success: false,
        message: 'API密钥无效，请检查密钥是否正确',
        details: {
          errorType: 'auth',
          url: testUrl,
          statusCode: error?.status || 401,
          hint: '密钥可能已过期、被禁用或从未激活'
        }
      };
    }

    if (error?.type === 'quota' || error?.status === 429) {
      return {
        success: false,
        message: 'API配额已用尽，请检查账户余额',
        details: {
          errorType: 'quota',
          url: testUrl,
          statusCode: error?.status || 429,
          hint: '免费额度用尽或达到账户限制'
        }
      };
    }

    if (error?.type === 'timeout' || error?.name === 'AbortError') {
      return {
        success: false,
        message: '连接超时，请检查网络或Base URL',
        details: {
          errorType: 'timeout',
          url: testUrl,
          hint: '服务器响应过慢，可能网络不通或URL错误'
        }
      };
    }

    if (error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('NetworkError') ||
        error?.message?.includes('CORS') ||
        error?.message?.includes('Network request failed')) {
      return {
        success: false,
        message: '无法连接到服务器，请检查网络或代理设置',
        details: {
          errorType: 'network',
          url: testUrl,
          hint: '浏览器直接调用可能被CORS拦截，建议通过后端转发'
        }
      };
    }

    if (error?.status === 403) {
      return {
        success: false,
        message: '访问被拒绝，请检查Base URL是否正确',
        details: {
          errorType: 'auth',
          url: testUrl,
          statusCode: 403,
          hint: 'URL可能不正确，或该服务不允许从此域名访问'
        }
      };
    }

    if (error?.status === 404) {
      return {
        success: false,
        message: 'API端点不存在，请检查Base URL',
        details: {
          errorType: 'format',
          url: testUrl,
          statusCode: 404,
          hint: 'URL可能缺少路径，例如应该是 https://api.deepseek.com/v1 而不是 https://api.deepseek.com'
        }
      };
    }

    if (error?.status >= 500) {
      return {
        success: false,
        message: `服务器错误（代码：${error?.status || '5xx'}），请稍后重试`,
        details: {
          errorType: 'server',
          url: testUrl,
          statusCode: error?.status,
          hint: '服务端问题，通常稍后恢复'
        }
      };
    }

    return {
      success: false,
      message: error?.message || '连接失败，请检查配置',
      details: {
        errorType: 'unknown',
        url: testUrl,
        statusCode: error?.status,
        rawError: error?.message,
        hint: '请检查Base URL和密钥格式是否正确'
      }
    };
  }
};

export const getCurlCommand = (baseUrl: string, apiKey: string): string => {
  const url = baseUrl.replace(/\/$/, '') + '/chat/completions';
  const maskedKey = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
  return `curl ${url} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${maskedKey}" \\
  -d '{"model": "deepseek-chat", "messages": [{"role": "user", "content": "Hi"}], "max_tokens": 5}'`;
};