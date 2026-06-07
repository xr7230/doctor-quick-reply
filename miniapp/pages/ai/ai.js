const API_URL = 'https://api.deepseek.com/v1/chat/completions';
const KEY_STORAGE = 'deepseek_api_key';

const SYSTEM_PROMPT = '你是一位医生，正在通过文字和你的患者沟通。任务：根据患者背景信息生成3种风格的回复草稿。原则：1.严格基于患者背景，不编造 2.语言简短自然 3.以安慰鼓励为主 4.不用Markdown符号 5.不输出标签标题';

function buildUserPrompt(doctorInput, patientContext, scenario) {
  return '患者背景：' + patientContext + '\n\n' +
    '医生想表达：' + doctorInput + '\n\n' +
    '场景：' + scenario + '\n\n' +
    '请直接输出3段医生对患者说的话，每段之间用一个空行分隔，不要任何标记：\n' +
    '第1段 温暖详细：关心处境+解释信息+明确建议+关心收尾。2-4句话。\n' +
    '第2段 简洁直接：只讲核心，1-2句话。\n' +
    '第3段 鼓励支持：肯定患者+正常化困难+表达陪伴。2-3句话。';
}

function parseResponse(content) {
  let cleaned = content.replace(/^[\d]+[\.\)、]\s*/gm, '').trim();
  if (/\*\*|###/.test(cleaned)) return null;
  if (/(?:版本|方案|[ABC][：:])/.test(cleaned)) return null;
  const paragraphs = cleaned.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);
  if (paragraphs.length >= 3) {
    return { versionA: paragraphs[0], versionB: paragraphs[1], versionC: paragraphs[2] };
  }
  const lines = cleaned.split('\n').filter(l => l.trim());
  if (lines.length >= 6) {
    const third = Math.ceil(lines.length / 3);
    return {
      versionA: lines.slice(0, third).join('\n'),
      versionB: lines.slice(third, third * 2).join('\n'),
      versionC: lines.slice(third * 2).join('\n')
    };
  }
  return null;
}

Page({
  data: {
    apiKey: '',
    hasKey: false,
    showKeyEdit: false,
    doctorInput: '',
    patientContext: '',
    scenario: '安抚',
    scenarios: ['安抚', '告知坏消息', '处理投诉', '用药疑问', '术后焦虑'],
    loading: false,
    error: '',
    replies: null
  },

  onShow() {
    const key = wx.getStorageSync(KEY_STORAGE) || '';
    this.setData({ apiKey: key, hasKey: !!key });
  },

  onInput(e) { this.setData({ doctorInput: e.detail.value }); },
  onCtxInput(e) { this.setData({ patientContext: e.detail.value }); },
  setScenario(e) { this.setData({ scenario: e.currentTarget.dataset.s }); },
  onKeyInput(e) { this.setData({ apiKey: e.detail.value }); },

  saveKey() {
    const key = this.data.apiKey.trim();
    if (!key.startsWith('sk-')) {
      wx.showToast({ title: '密钥格式错误', icon: 'none' });
      return;
    }
    wx.setStorageSync(KEY_STORAGE, key);
    this.setData({ hasKey: true, showKeyEdit: false });
    wx.showToast({ title: '密钥已保存', icon: 'success' });
  },

  showKeySettings() {
    this.setData({ showKeyEdit: !this.data.showKeyEdit });
  },

  cancelKey() {
    this.setData({ showKeyEdit: false, apiKey: wx.getStorageSync(KEY_STORAGE) || '' });
  },

  copy(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.content,
      success() { wx.showToast({ title: '已复制', icon: 'success' }); }
    });
  },

  generate() {
    const { doctorInput, patientContext, scenario, apiKey } = this.data;
    if (!doctorInput.trim() || !patientContext.trim()) {
      this.setData({ error: '请填写医生输入和患者背景' });
      return;
    }
    if (!apiKey.trim()) {
      this.setData({ error: '请先配置 API Key' });
      return;
    }

    this.setData({ loading: true, error: '', replies: null });

    wx.request({
      url: API_URL,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      data: {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(doctorInput, patientContext, scenario) }
        ],
        temperature: 0.7,
        max_tokens: 800
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.choices) {
          const content = res.data.choices[0].message.content;
          const parsed = parseResponse(content);
          if (parsed) {
            this.setData({ replies: parsed, loading: false });
          } else {
            this.setData({ error: 'AI返回格式异常，请重试', loading: false });
          }
        } else {
          this.setData({ error: 'API调用失败(' + (res.statusCode || '?') + ')，请检查密钥', loading: false });
        }
      },
      fail: () => {
        this.setData({ error: '网络错误，请检查连接', loading: false });
      }
    });
  }
});