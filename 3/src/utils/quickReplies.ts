export interface QuickReply {
  id: string;
  content: string;
  category: string;
  createdAt: string;
}

const STORAGE_KEY = 'quick_replies';
const CAT_KEY = 'quick_reply_categories';
const INIT_KEY = 'qr_initialized';

export const DEFAULT_CATEGORIES = ['术后叮嘱', '检查通知', '用药说明', '日常问候', '其他'];

const DEFAULTS: Omit<QuickReply, 'id' | 'createdAt'>[] = [
  { category: '术后叮嘱', content: '您的手术很顺利，现在恢复期要注意：按时吃药，伤口保持干燥，饮食清淡，适当活动。下周三来复查，有任何不舒服随时联系我。' },
  { category: '术后叮嘱', content: '恢复得不错！继续保持，术后三个月内避免剧烈运动和重体力劳动。记得按时来复查，我们一起把关。' },
  { category: '检查通知', content: '您好，您预约的CT检查安排在明天上午9点，请空腹前来，检查前4小时不要吃东西。到门诊二楼放射科，到了报名字就行。' },
  { category: '检查通知', content: '您的化验结果出来了，各项指标都在正常范围，请放心。下次复查时间是三个月后。' },
  { category: '用药说明', content: '这个药每天早晚各一次，饭后半小时吃，用温水送服。服药期间不要喝酒，如果出现皮疹或胃不舒服就停药联系我。' },
  { category: '用药说明', content: '开的药一共三种：白的早晚各一片，蓝色的睡前一片，红色的疼的时候吃一片。记得按时服药，不要自行停药。' },
  { category: '日常问候', content: '最近感觉怎么样？天气转凉注意保暖，别感冒了。如果有什么不舒服及时跟我说。' },
  { category: '日常问候', content: '恢复需要时间，别着急。您已经比上周好多了，一步一步来。有什么问题随时问我。' },
];

export function getAll(): QuickReply[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function getCategories(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CAT_KEY) || JSON.stringify(DEFAULT_CATEGORIES));
  } catch { return DEFAULT_CATEGORIES; }
}

export function saveCategories(cats: string[]) {
  localStorage.setItem(CAT_KEY, JSON.stringify(cats));
}

export function ensureDefaults() {
  if (localStorage.getItem(INIT_KEY)) return;
  const existing = getAll();
  if (existing.length === 0) {
    const withIds = DEFAULTS.map((d, i) => ({ ...d, id: 'default_' + i, createdAt: new Date().toISOString() }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withIds));
  }
  localStorage.setItem(INIT_KEY, '1');
}

export function add(item: Omit<QuickReply, 'id' | 'createdAt'>): QuickReply[] {
  const list = getAll();
  const newItem: QuickReply = { ...item, id: Date.now().toString(), createdAt: new Date().toISOString() };
  list.unshift(newItem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
}

export function update(id: string, item: Partial<Omit<QuickReply, 'id' | 'createdAt'>>): QuickReply[] {
  const list = getAll();
  const idx = list.findIndex(t => t.id === id);
  if (idx > -1) list[idx] = { ...list[idx], ...item };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
}

export function remove(id: string): QuickReply[] {
  const list = getAll().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
}