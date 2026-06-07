const STORAGE_KEY = 'templates';
const CATEGORY_KEY = 'categories';
const INIT_KEY = 'initialized';

const DEFAULTS = [
  { category: "术后叮嘱", content: "您的手术很顺利，现在恢复期要注意：按时吃药，伤口保持干燥，饮食清淡，适当活动。下周三来复查，有任何不舒服随时联系我。" },
  { category: "术后叮嘱", content: "恢复得不错！继续保持，术后三个月内避免剧烈运动和重体力劳动。记得按时来复查，我们一起把关。" },
  { category: "检查通知", content: "您好，您预约的CT检查安排在明天上午9点，请空腹前来，检查前4小时不要吃东西。到门诊二楼放射科，到了报名字就行。" },
  { category: "检查通知", content: "您的化验结果出来了，各项指标都在正常范围，请放心。下次复查时间是三个月后。" },
  { category: "用药说明", content: "这个药每天早晚各一次，饭后半小时吃，用温水送服。服药期间不要喝酒，如果出现皮疹或胃不舒服就停药联系我。" },
  { category: "用药说明", content: "开的药一共三种：白的早晚各一片，蓝色的睡前一片，红色的疼的时候吃一片。记得按时服药，不要自行停药。" },
  { category: "日常问候", content: "最近感觉怎么样？天气转凉注意保暖，别感冒了。如果有什么不舒服及时跟我说。" },
  { category: "日常问候", content: "恢复需要时间，别着急。您已经比上周好多了，一步一步来。有什么问题随时问我。" }
];

function getAll() {
  return wx.getStorageSync(STORAGE_KEY) || [];
}

function saveAll(list) {
  wx.setStorageSync(STORAGE_KEY, list);
}

function getCategories() {
  return wx.getStorageSync(CATEGORY_KEY) || ["术后叮嘱", "检查通知", "用药说明", "日常问候", "其他"];
}

function saveCategories(list) {
  wx.setStorageSync(CATEGORY_KEY, list);
}

function ensureDefaults() {
  if (wx.getStorageSync(INIT_KEY)) return;
  const existing = getAll();
  if (existing.length === 0) {
    saveAll(DEFAULTS.map((d, i) => ({ ...d, id: 'default_' + i, createdAt: new Date().toISOString() })));
  }
  wx.setStorageSync(INIT_KEY, true);
}

function add(item) {
  const list = getAll();
  list.unshift({ ...item, id: Date.now().toString(), createdAt: new Date().toISOString() });
  saveAll(list);
  return list;
}

function update(id, item) {
  const list = getAll();
  const idx = list.findIndex(t => t.id === id);
  if (idx > -1) {
    list[idx] = { ...list[idx], ...item, updatedAt: new Date().toISOString() };
    saveAll(list);
  }
  return list;
}

function remove(id) {
  const list = getAll().filter(t => t.id !== id);
  saveAll(list);
  return list;
}

function getByCategory(category) {
  return getAll().filter(t => t.category === category);
}

module.exports = { getAll, saveAll, getCategories, saveCategories, add, update, remove, getByCategory, ensureDefaults };