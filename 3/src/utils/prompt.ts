// 危险关键词列表——输出中绝不能出现这些
const DANGEROUS_PATTERNS = [
  /具体剂量[是为]\d+[mg毫克g克ml毫升]/,
  /每天\s*\d+\s*[次片粒]/,
  /处方[是为]\s*\w+/,
  /每次\s*\d+\s*[mMgG克毫微]/,
  /保证.*治愈/,
  /100%.*有效/,
  /绝对.*安全/,
  /代替.*医生/,
  /无需.*就医/,
  /自行.*手术/,
  /停药.*建议/,
];

export function filterDangerousContent(text: string): { filtered: string; warnings: string[] } {
  const warnings: string[] = [];
  let filtered = text;
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(filtered)) {
      warnings.push('检测到可能涉及具体医疗建议的内容，已做模糊化处理');
      filtered = filtered.replace(pattern, '[请遵医嘱]');
    }
  }
  return { filtered, warnings };
}

export const generateSystemPrompt = (): string => {
  return '你是一位医生，正在通过文字和你的患者沟通。任务：根据患者背景信息生成3种风格的回复草稿。\n\n' +
    '原则：1.严格基于患者背景，不编造 2.语言简短自然 3.以安慰鼓励为主 4.不用Markdown符号 5.不输出标签标题';
};

export const generateUserPrompt = (
  doctorInput: string,
  patientContext: string,
  scenarioType: string
): string => {
  return '患者背景：' + patientContext + '\n\n' +
    '医生想表达：' + doctorInput + '\n\n' +
    '场景：' + scenarioType + '\n\n' +
    '请直接输出3段医生对患者说的话，每段之间用一个空行分隔，不要任何标记：\n' +
    '第1段 温暖详细：关心处境+解释信息+明确建议+关心收尾。2-4句话。\n' +
    '第2段 简洁直接：只讲核心，1-2句话。\n' +
    '第3段 鼓励支持：肯定患者+正常化困难+表达陪伴。2-3句话。';
};

export const parseApiResponse = (content: string): { versionA: string; versionB: string; versionC: string } | null => {
  // 1. 预处理：去除常见编号前缀（AI 经常忽略不输出编号的指令）
  let cleaned = content.replace(/^[\d]+[\.\)、]\s*/gm, '').trim();

  // 2. 检查是否有 Markdown 结构符号（去除编号后再检查）
  const hasMarkdownSymbols = /\*\*|###/m.test(cleaned);
  if (hasMarkdownSymbols) return null;

  // 3. 检查是否有结构标签
  const hasStructureTags = /(?:版本[ABC一二三]|方案[ABC一二三]|[ABC][：:]|处境观察|医学信息|核心信息|关键行动)/.test(cleaned);
  if (hasStructureTags) return null;

  // 4. 按双换行（段落）分割
  const paragraphs = cleaned.split(/\n\n+/).map((p: string) => p.trim()).filter((p: string) => p.length > 0);

  if (paragraphs.length >= 3) {
    return { versionA: paragraphs[0], versionB: paragraphs[1], versionC: paragraphs[2] };
  }

  // 5. 如果段落不足3个，按行数等分回退
  const linesArr = cleaned.split('\n').filter((line: string) => line.trim() !== '');
  if (linesArr.length >= 6) {
    const third = Math.ceil(linesArr.length / 3);
    return {
      versionA: linesArr.slice(0, third).join('\n'),
      versionB: linesArr.slice(third, third * 2).join('\n'),
      versionC: linesArr.slice(third * 2).join('\n')
    };
  }

  return null;
};