import { describe, it, expect } from 'vitest';
import { generateMockReply } from '../utils/mockReply';
import { ScenarioType } from '../types';

describe('generateMockReply - smart version', () => {
  const scenarios: ScenarioType[] = ['安抚', '告知坏消息', '处理投诉', '用药疑问', '术后焦虑'];

  it('returns three non-empty versions for all scenarios', () => {
    for (const scene of scenarios) {
      const reply = generateMockReply(scene, '继续治疗两周', '35岁男性');
      expect(reply.versionA.length).toBeGreaterThan(20);
      expect(reply.versionB.length).toBeGreaterThan(5);
      expect(reply.versionC.length).toBeGreaterThan(20);
    }
  });

  it('generates different replies for same input (randomization)', () => {
    const replies = new Set<string>();
    for (let i = 0; i < 10; i++) {
      replies.add(generateMockReply('安抚', '继续治疗', '30岁女性').versionA);
    }
    // At least 2 distinct versions thanks to templates randomization
    expect(replies.size).toBeGreaterThan(1);
  });

  it('detects first visit and adjusts tone', () => {
    // Templates are randomized, try multiple times
    let foundFirstVisit = false;
    for (let i = 0; i < 20; i++) {
      const reply = generateMockReply('安抚', '首次来就诊，最近头痛', '');
      const fullText = reply.versionA + reply.versionC;
      if (/第一[次回]|您第一次|初[次诊]/.test(fullText)) {
        foundFirstVisit = true;
        break;
      }
    }
    expect(foundFirstVisit).toBe(true);
  });

  it('detects timeframe and includes it', () => {
    const reply = generateMockReply('安抚', '继续治疗，两周后复查', '');
    expect(reply.versionA + reply.versionB).toMatch(/两周/);
  });

  it('detects medication context', () => {
    const reply = generateMockReply('用药疑问', '这个降压药怎么吃', '高血压');
    expect(reply.versionA + reply.versionB).toMatch(/降压药|用药/);
  });

  it('version B is always concise (shorter than A)', () => {
    for (const scene of scenarios) {
      const reply = generateMockReply(scene, '继续治疗两周', '35岁女性');
      expect(reply.versionB.length).toBeLessThan(reply.versionA.length);
    }
  });

  it('post-surgery scenario mentions recovery signs', () => {
    const reply = generateMockReply('术后焦虑', '伤口有点疼', '术后第二天');
    expect(reply.versionA + reply.versionC).toMatch(/恢复|修复/);
  });

  it('complaint scenario acknowledges the issue', () => {
    const reply = generateMockReply('处理投诉', '排队时间太长了', '');
    expect(reply.versionA + reply.versionC).toMatch(/反馈|改进/);
  });
});