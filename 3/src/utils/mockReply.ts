import { ScenarioType, Reply } from '../types';

// ---- 关键词提取 ----

interface ExtractedInfo {
  action: string;        // 核心动作：继续/调整/复查/停药/手术/观察
  timeframe: string;     // 时间：立即/明天/一周/两周/一个月/近期
  medication: string;    // 药物相关
  isFirstVisit: boolean; // 是否首诊
  isUrgent: boolean;     // 是否紧急
  keyPoint: string;      // 其他关键点
}

function extractInfo(input: string, context: string): ExtractedInfo {
  const text = input + ' ' + context;
  
  // 动作识别
  let action = '治疗';
  if (/继续|维持|沿用/.test(text)) action = '继续当前治疗';
  else if (/调整|换|改用|换药/.test(text)) action = '调整治疗方案';
  else if (/复查|复诊|检查|CT|B超|化验/.test(text)) action = '安排复查';
  else if (/停药|停用|减量|减少/.test(text)) action = '调整用药';
  else if (/手术|术前|术后|开刀/.test(text)) action = '手术相关事宜';
  else if (/观察|随访|跟踪/.test(text)) action = '持续观察';

  // 时间识别
  let timeframe = '近期';
  if (/立即|马上|现在|即刻/.test(text)) timeframe = '立即';
  else if (/明天|明日/.test(text)) timeframe = '明天';
  else if (/三天|3天/.test(text)) timeframe = '三天后';
  else if (/一周|1周|七天|7天/.test(text)) timeframe = '一周后';
  else if (/两周|2周|14天|十四天/.test(text)) timeframe = '两周后';
  else if (/一个月|1个月|30天/.test(text)) timeframe = '一个月后';
  else if (/三个月|3个月/.test(text)) timeframe = '三个月后';

  // 药物相关
  let medication = '';
  const medMatch = text.match(/(?:药|用药|服用|剂量)([^，。,\.]{0,10})/);
  if (medMatch) medication = medMatch[1].trim();

  // 首诊判断
  const isFirstVisit = /首[次回]|第一[次回]|初[次回诊]|新[患者来]/.test(text);
  const isUrgent = /紧急|急|马上|快|立即|危|重/.test(text);

  // 关键点提取
  let keyPoint = '';
  if (text.length > 0) {
    const clean = text.replace(/[，。,\.!！?？\s]+/g, ' ').trim();
    keyPoint = clean.substring(0, 30);
  }

  return { action, timeframe, medication, isFirstVisit, isUrgent, keyPoint };
}

// ---- 句式变体池 ----

const openings = {
  安抚: [
    (info: ExtractedInfo) => `感谢您的信任。关于${info.action}，我结合您目前的情况做了分析。`,
    (info: ExtractedInfo) => `您好，针对您提到的${info.keyPoint}，我和您详细说明一下。`,
    (info: ExtractedInfo) => `根据您这次的描述，${info.action}的方向是对的，我给您梳理一下。`,
    (info: ExtractedInfo) => `${info.isFirstVisit ? '您第一次来就医就很及时，' : ''}关于${info.action}，目前的判断是这样的。`,
  ],
  告知坏消息: [
    (info: ExtractedInfo) => `您这次检查结果出来了，请先别紧张。虽然发现的${info.keyPoint}需要重视，但我们有成熟的应对方案。`,
    (info: ExtractedInfo) => `检查结果我仔细看过了，有一些需要我们共同面对的情况。${info.isUrgent ? '但请不要担心，' : ''}我们团队已经制定了详细计划。`,
    (info: ExtractedInfo) => `关于这次的检查，我需要和您坦诚地沟通。${info.keyPoint}的发现虽然让我们需要更加谨慎，但现代医学对此已有明确的应对策略。`,
  ],
  处理投诉: [
    (info: ExtractedInfo) => `感谢您愿意坦诚反馈。您提到的${info.keyPoint}我认真听进去了。`,
    (info: ExtractedInfo) => `您这次的反馈非常宝贵，${info.keyPoint}确实是我们需要改进的地方。`,
    (info: ExtractedInfo) => `首先谢谢您花时间告诉我们。关于${info.keyPoint}，让我来解释一下实际情况。`,
  ],
  用药疑问: [
    (info: ExtractedInfo) => `关于您问的${info.medication || '用药'}问题，这是个好问题，我详细解释。`,
    (info: ExtractedInfo) => `${info.medication || '这个药'}的使用确实需要根据具体情况调整，我帮您理一理。`,
    (info: ExtractedInfo) => `您能主动关心用药细节，这是非常负责任的态度。${info.medication ? `关于${info.medication}，` : ''}我来具体说明。`,
  ],
  术后焦虑: [
    (info: ExtractedInfo) => `术后${info.timeframe}这个阶段，出现顾虑非常正常。身体在修复过程中会有各种信号。`,
    (info: ExtractedInfo) => `您术后${info.timeframe}的反馈我收到了。这个阶段有些不适感恰恰是恢复的表现。`,
    (info: ExtractedInfo) => `恢复期的感受我完全理解。手术后的${info.timeframe}，身体正在积极地修复自己。`,
  ],
};

const bodies = {
  安抚: [
    (info: ExtractedInfo) => `${info.isFirstVisit ? '我们已为您制定了完整的诊疗计划，' : `基于之前的治疗反馈，`}下一步需要${info.action}，并在${info.timeframe}进行复查。整个过程中我们会持续跟踪您的指标变化。`,
    (info: ExtractedInfo) => `目前的方案是${info.action}，预期${info.timeframe}会看到阶段性改善。我会根据您的恢复节奏微调方案，确保效果最优。`,
    (info: ExtractedInfo) => `${info.action}的方案已经明确。${info.timeframe}后我们再评估一次，看看是否需要进一步优化。`,
  ],
  告知坏消息: [
    (info: ExtractedInfo) => `我们已经制定了包含${info.action}在内的综合方案。${info.timeframe}内我们会完成进一步的精准评估，确保每一步都走在正确的方向上。现代医学对此类情况的处理已经相当成熟。`,
    (info: ExtractedInfo) => `下一步是${info.action}，${info.timeframe}我们会安排一次深度检查来指导后续治疗。请相信，我们有完整的路线图。`,
    (info: ExtractedInfo) => `治疗策略上，我们会采取${info.action}的方式，${info.timeframe}进行阶段性评估。每一步我都会和您充分沟通。`,
  ],
  处理投诉: [
    (info: ExtractedInfo) => `关于${info.keyPoint}，实际情况是这样的——[请补充具体原因]。我们已经在${info.timeframe}内采取了以下改进措施：一是优化流程，二是加强沟通。`,
    (info: ExtractedInfo) => `您反映的${info.keyPoint}问题，我们团队${info.timeframe}内做了复盘。目前已明确改进方案，接下来会落实到位。`,
    (info: ExtractedInfo) => `${info.keyPoint}方面确实有不足，我们已经启动改进流程。${info.timeframe}内您应该能看到变化。`,
  ],
  用药疑问: [
    (info: ExtractedInfo) => `根据您的情况，${info.medication || '该药物'}的用法是——[请医嘱说明]。${info.timeframe}是一个观察周期，期间如果有任何异常感觉（比如头晕、皮疹、胃肠不适），请随时告诉我们。`,
    (info: ExtractedInfo) => `${info.medication || '目前的用药方案'}建议${info.action}，疗程大约${info.timeframe}。不同人体质反应不同，我们需要边用边调整。`,
    (info: ExtractedInfo) => `用药原则是${info.action}，${info.timeframe}后评估效果。这期间不要自行增减剂量，有任何不适第一时间联系我。`,
  ],
  术后焦虑: [
    (info: ExtractedInfo) => `${info.timeframe}内出现轻微疼痛、肿胀、或偶尔的刺痛感都是正常的修复信号。这是因为组织在愈合过程中会释放炎症因子。但如果出现高热（>38.5℃）、伤口明显红肿渗液、或剧烈疼痛，请立即联系我们。`,
    (info: ExtractedInfo) => `恢复过程大致分三个阶段：${info.timeframe}内是急性修复期，之后进入重塑期。目前的感受证明修复正在进行中。正常活动可以逐步恢复，但避免剧烈运动。`,
    (info: ExtractedInfo) => `术后${info.timeframe}的恢复重点是：适度活动促进循环、保持伤口清洁干燥、均衡营养支持愈合。这些基础措施做好了，恢复会顺利很多。`,
  ],
};

const closings = {
  安抚: [
    '请您放心，我们会全程陪伴。您还有其他问题想问吗？',
    '有任何新的不适或疑问，随时可以联系我。',
    '健康路上您不是一个人，我们一起面对。',
    '后续如果有任何变化，及时沟通，我随时在线。',
  ],
  告知坏消息: [
    '您现在有什么问题想先问我的吗？我就在这里。',
    '我知道这不是容易接受的消息，但请记住我们是一个团队。',
    '我会全程陪您走好接下来的每一步。',
  ],
  处理投诉: [
    '您的意见对我们非常重要，希望您能给我们改进的机会。',
    '后续如果您还有任何不满意的地方，请直接找我。',
    '我们一定用行动来回应您的信任。',
  ],
  用药疑问: [
    '用药安全是我们的底线，有任何疑虑随时问，不要不好意思。',
    '记住：宁可多问一句，不要冒险用药。',
    '我们对药物的目标是：安全第一，效果第二。',
  ],
  术后焦虑: [
    '恢复是一个过程，不是一个事件。有耐心，有我们陪着您。',
    '每次的微小进步，都是通向康复的一步。',
    '有任何不正常的信号，宁可多跑一趟医院，不要自己扛。',
  ],
};

// ---- 随机选取 ----

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---- 主函数 ----

export function generateMockReply(scene: ScenarioType, input: string, context: string): Reply {
  const info = extractInfo(input, context);
  const scenarioKey = scene as keyof typeof openings;
  const sceneOpenings = openings[scenarioKey] || openings['安抚'];
  const sceneBodies = bodies[scenarioKey] || bodies['安抚'];
  const sceneClosings = closings[scenarioKey] || closings['安抚'];

  // 版本A: 温暖详细 = 开场 + 主体 + 收尾
  const versionA = [
    pick(sceneOpenings)(info),
    pick(sceneBodies)(info),
    pick(sceneClosings),
  ].join('');

  // 版本B: 简洁清晰 = 核心信息 + 关键行动 (2-3句)
  const bLines = [
    `${info.action}，${info.timeframe}${scene === '术后焦虑' || scene === '安抚' ? '复查' : '评估'}。`,
    scene === '用药疑问' ? '请严格按医嘱服药，有任何不适立即联系我们。'
      : scene === '术后焦虑' ? '轻微不适属正常，异常情况（高热/剧痛/红肿渗液）立即就医。'
      : scene === '告知坏消息' ? '我们有具体的治疗路线图，下一步将进行精准评估。'
      : scene === '处理投诉' ? '您的反馈已进入处理流程，我们会立即改进。'
      : '保持规律作息，有问题随时沟通。',
  ].filter(Boolean).join('');
  // 如果 B 太短，补充一句
  const versionB = bLines.length < 30
    ? bLines + '请放心，情况在可控范围内。'
    : bLines;

  // 版本C: 鼓励支持 = 肯定患者 + 正常化 + 强调同盟
  const cOpenings = [
    info.isFirstVisit ? '您第一次来就如此重视自己的健康，这非常好。' : '您能坚持配合治疗，这份毅力很了不起。',
    '看到您主动关心恢复进展，作为医生我很欣慰。',
    '面对健康问题，您表现出的理性和勇气值得肯定。',
  ];
  const cBodies = [
    info.isUrgent ? '虽然情况需要尽快处理，但请记住：我们是一个团队，每一步我都会和您一起走。'
      : `${info.timeframe}的恢复期或调整期很正常，身体需要时间，不用给自己太大压力。`,
    `${scene === '术后焦虑' ? '恢复过程中的不适感' : '治疗过程中的波动'}并不可怕，这是身体在积极应对的信号。`,
    '健康管理是场马拉松，我们一起调整节奏，不急于一时。',
  ];
  const versionC = pick(cOpenings) + pick(cBodies) + pick(sceneClosings);

  return { versionA, versionB, versionC };
}