import { ChatRequest, ChatResponse, ErrorInfo, ErrorType } from '../../types';

type AuthHeaderName = 'Authorization' | 'X-DashScope-Api-Key';
type ResponseParser = (data: any) => string;

interface AdapterOptions {
  defaultModel: string;
  authHeaderName: AuthHeaderName;
  parseResponse: ResponseParser;
}

function createAdapter({ defaultModel, authHeaderName, parseResponse }: AdapterOptions) {
  return async (baseUrl: string, apiKey: string, request: ChatRequest): Promise<ChatResponse> => {
    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [authHeaderName]: authHeaderName === 'Authorization' ? `Bearer ${apiKey}` : apiKey,
        },
        body: JSON.stringify({
          model: request.model || defaultModel,
          messages: request.messages,
          temperature: request.temperature || 0.7,
          max_tokens: request.max_tokens || 1000,
        }),
      });

      if (!response.ok) {
        await response.json().catch(() => ({}));
        let errorType: ErrorType = 'unknown';
        let errorMessage = 'API调用失败';

        if (response.status === 401) {
          errorType = 'auth';
          errorMessage = 'API密钥验证失败，请检查';
        } else if (response.status === 429) {
          errorType = 'quota';
          errorMessage = 'API额度不足，请充值或更换密钥';
        } else if (response.status >= 500) {
          errorMessage = '服务器错误，请稍后重试';
        }

        throw { type: errorType, message: errorMessage } as ErrorInfo;
      }

      const data = await response.json();
      const content = parseResponse(data);

      if (!content) {
        throw { type: 'unknown' as ErrorType, message: 'API返回格式错误' };
      }

      return { content, usage: data.usage };
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error;
      }

      throw { type: 'network', message: '网络连接失败，请检查网络或切换模型' } as ErrorInfo;
    }
  };
}

const openAIParser: ResponseParser = (data) => {
  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message?.content || '';
  }
  return '';
};

const dashScopeParser: ResponseParser = (data) => {
  if (data.output && data.output.text) {
    return data.output.text;
  }
  return '';
};

const multiFormatParser: ResponseParser = (data) => {
  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message?.content || '';
  }
  if (data.output && data.output.text) {
    return data.output.text;
  }
  if (data.content) {
    return data.content;
  }
  return '';
};

export const deepseekAdapter = createAdapter({
  defaultModel: 'deepseek-chat',
  authHeaderName: 'Authorization',
  parseResponse: openAIParser,
});

export const glmAdapter = createAdapter({
  defaultModel: 'glm-4',
  authHeaderName: 'Authorization',
  parseResponse: openAIParser,
});

export const qwenAdapter = createAdapter({
  defaultModel: 'qwen-turbo',
  authHeaderName: 'X-DashScope-Api-Key',
  parseResponse: dashScopeParser,
});

export const customAdapter = createAdapter({
  defaultModel: 'custom-model',
  authHeaderName: 'Authorization',
  parseResponse: multiFormatParser,
});