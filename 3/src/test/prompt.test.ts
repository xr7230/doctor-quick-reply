import { describe, it, expect } from 'vitest';
import { generateSystemPrompt, generateUserPrompt, parseApiResponse, filterDangerousContent } from '../utils/prompt';

describe('generateSystemPrompt', () => {
  it('returns a non-empty string', () => {
    const prompt = generateSystemPrompt();
    expect(prompt).toBeTruthy();
    expect(prompt.length).toBeGreaterThan(20);
  });
  it('contains core behavior rules', () => {
    const prompt = generateSystemPrompt();
    expect(prompt).toContain('医生');
    expect(prompt).toContain('患者');
  });
  it('does not use Markdown in its own content', () => {
    const prompt = generateSystemPrompt();
    expect(prompt).not.toContain('**');
    expect(prompt).not.toContain('###');
  });
});

describe('generateUserPrompt', () => {
  it('includes doctor input, patient context, and scenario', () => {
    const result = generateUserPrompt('继续治疗', '35岁女性', '安抚');
    expect(result).toContain('继续治疗');
    expect(result).toContain('35岁女性');
    expect(result).toContain('安抚');
  });
  it('includes output format instructions', () => {
    const result = generateUserPrompt('test', 'ctx', '安抚');
    expect(result).toContain('温暖详细');
    expect(result).toContain('简洁直接');
    expect(result).toContain('鼓励支持');
  });
  it('accepts any scenario type string', () => {
    expect(generateUserPrompt('t','c','告知坏消息')).toContain('告知坏消息');
    expect(generateUserPrompt('t','c','术后焦虑')).toContain('术后焦虑');
  });
});

describe('parseApiResponse', () => {
  it('returns null for content with Markdown symbols', () => {
    expect(parseApiResponse('**bold** text')).toBeNull();
    expect(parseApiResponse('### heading')).toBeNull();
  });
  it('returns null for content with structure tags', () => {
    expect(parseApiResponse('版本A: hello')).toBeNull();
    expect(parseApiResponse('方案A：内容')).toBeNull();
    expect(parseApiResponse('处境观察: test')).toBeNull();
  });
  it('strips numbered prefixes and parses correctly', () => {
    const input = '1. 第一段内容\n\n2. 第二段内容\n\n3. 第三段内容';
    const result = parseApiResponse(input);
    expect(result).not.toBeNull();
    expect(result!.versionA).toContain('第一段');
    expect(result!.versionB).toContain('第二段');
    expect(result!.versionC).toContain('第三段');
  });
  it('parses three plain text paragraphs', () => {
    const result = parseApiResponse('第一段内容，医生对患者说的话。\n\n第二段内容，简洁直接。\n\n第三段内容，鼓励支持。');
    expect(result).not.toBeNull();
    expect(result!.versionA).toContain('第一段');
    expect(result!.versionB).toContain('第二段');
    expect(result!.versionC).toContain('第三段');
  });
  it('parses content with only line breaks (no blank lines)', () => {
    const result = parseApiResponse('line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9');
    expect(result).not.toBeNull();
    expect(result!.versionA).toBeTruthy();
    expect(result!.versionB).toBeTruthy();
    expect(result!.versionC).toBeTruthy();
  });
  it('returns null for content too short', () => {
    expect(parseApiResponse('short\nreply\nonly')).toBeNull();
  });
  it('handles multiple blank lines between paragraphs', () => {
    const result = parseApiResponse('第一段\n\n\n第二段\n\n\n\n第三段');
    expect(result).not.toBeNull();
    expect(result!.versionA).toContain('第一段');
    expect(result!.versionB).toContain('第二段');
    expect(result!.versionC).toContain('第三段');
  });
  it('handles real AI output format (numbered, mixed newlines)', () => {
    const realOutput = '1. 我知道术后这一年您心里肯定很不容易，担心复发的压力我也都理解。\n\n2. 方案不变，下个月复查CT。放心，一切按计划走就好。\n\n3. 您已经坚持了整整一年，真的很了不起。';
    const result = parseApiResponse(realOutput);
    expect(result).not.toBeNull();
    expect(result!.versionA).toContain('术后这一年');
    expect(result!.versionB).toContain('方案不变');
    expect(result!.versionC).toContain('坚持了整整一年');
  });
});

describe('filterDangerousContent', () => {
  it('flags specific dosage patterns', () => {
    const { filtered, warnings } = filterDangerousContent('建议每天2次，每次50mg');
    expect(warnings.length).toBeGreaterThan(0);
    expect(filtered).not.toContain('50mg');
    expect(filtered).toContain('[请遵医嘱]');
  });
  it('flags cure guarantees', () => {
    const { filtered, warnings } = filterDangerousContent('保证100%有效治愈');
    expect(warnings.length).toBeGreaterThan(0);
    expect(filtered).toContain('[请遵医嘱]');
  });
  it('flags "no need to see doctor" content', () => {
    const { warnings } = filterDangerousContent('无需就医，自己处理就行');
    expect(warnings.length).toBeGreaterThan(0);
  });
  it('passes clean content unchanged', () => {
    const { filtered, warnings } = filterDangerousContent('请按时复查，保持良好生活习惯');
    expect(warnings).toHaveLength(0);
    expect(filtered).toBe('请按时复查，保持良好生活习惯');
  });
  it('handles empty input', () => {
    const { filtered, warnings } = filterDangerousContent('');
    expect(warnings).toHaveLength(0);
    expect(filtered).toBe('');
  });
});