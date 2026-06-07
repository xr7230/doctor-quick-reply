import { describe, it, expect } from 'vitest';

// Replicate the mock reply generator from App.tsx for testing
function generateMockReply(scene: string, input: string, context: string) {
  const condition = context || '患者';
  const emotion = scene === '术后焦虑' ? '有些担心' : '有些不安';
  const responses: Record<string, { versionA: string; versionB: string; versionC: string }> = {
    '安抚': {
      versionA: `感谢您的信任。关于您提到的${input}，我仔细分析了您目前的情况。`,
      versionB: `您目前的情况在控制中，请放心。`,
      versionC: `看到您如此关心自己的健康，真的很好。`
    },
    '告知坏消息': {
      versionA: `目前的检查显示${condition}，这意味着我们需要进行更贴心的跟踪。`,
      versionB: `检查结果有些复杂，但我们已有具体方案。`,
      versionC: `感谢您一直以来的配合。这次检查发现的情况虽然需要更多关注。`
    },
    '处理投诉': {
      versionA: `感谢您的反馈。您提到的${input}对我们很重要。`,
      versionB: `您的反馈已收到，我们会立即处理。`,
      versionC: `感谢您愿意把这些告诉我们。您的反馈对我们很重要。`
    },
    '用药疑问': {
      versionA: `${condition}的用药需要根据您目前的具体情况来调整。`,
      versionB: `${condition}的用药请按医嘱进行。`,
      versionC: `用药过程中您能够主动询问，这很好。`
    },
    '术后焦虑': {
      versionA: `术后这个阶段感到${emotion}是很正常的。`,
      versionB: `术后恢复需要时间，轻微的不适是正常的。`,
      versionC: `您术后第一天，恢复得不错。`
    }
  };
  return responses[scene] || responses['安抚'];
}

describe('generateMockReply', () => {
  it('returns three versions for each scenario', () => {
    const scenarios = ['安抚', '告知坏消息', '处理投诉', '用药疑问', '术后焦虑'];
    for (const scene of scenarios) {
      const reply = generateMockReply(scene, '继续治疗', '35岁女性高血压');
      expect(reply.versionA).toBeTruthy();
      expect(reply.versionB).toBeTruthy();
      expect(reply.versionC).toBeTruthy();
    }
  });

  it('injects doctor input into version A', () => {
    const reply = generateMockReply('安抚', '继续治疗两周', '35岁女性');
    expect(reply.versionA).toContain('继续治疗两周');
  });

  it('injects patient condition into response', () => {
    const reply = generateMockReply('用药疑问', 'test', '高血压');
    expect(reply.versionA).toContain('高血压');
    expect(reply.versionB).toContain('高血压');
  });

  it('falls back to 安抚 for unknown scenario', () => {
    const reply = generateMockReply('nonexistent', 'test', 'ctx');
    expect(reply.versionA).toContain('感谢您的信任');
  });

  it('version B is shorter than version A', () => {
    const reply = generateMockReply('安抚', '继续当前治疗', '30岁男性');
    expect(reply.versionB.length).toBeLessThan(reply.versionA.length);
  });

  it('version C emphasizes encouragement and alliance', () => {
    const reply = generateMockReply('安抚', 'test', 'ctx');
    expect(reply.versionC).toContain('健康');
  });
});