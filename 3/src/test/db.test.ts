import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';

import {
  loadHistory, saveToHistory, deleteHistoryItem, clearAllHistory,
  loadTemplates, saveTemplate, deleteTemplateItem,
} from '../utils/db';
import type { HistoryRecord, Template } from '../utils/db';

const makeHistory = (overrides: Partial<Omit<HistoryRecord, 'id' | 'timestamp'>> = {}) => ({
  doctorInput: '继续治疗两周',
  patientContext: '35岁女性高血压',
  scenarioType: '安抚' as const,
  replies: { versionA: 'A内容', versionB: 'B内容', versionC: 'C内容' },
  mode: 'mock' as const,
  ...overrides,
});

const makeTemplate = (overrides: Partial<Omit<Template, 'id'>> = {}) => ({
  name: '测试模板',
  doctorInput: '继续治疗',
  patientContext: '35岁女性',
  scenarioType: '安抚' as const,
  ...overrides,
});

describe('IndexedDB history operations', () => {
  beforeEach(async () => {
    await clearAllHistory();
  });

  it('starts with empty history', async () => {
    const history = await loadHistory();
    expect(history).toEqual([]);
  });

  it('saves and loads history records', async () => {
    await saveToHistory(makeHistory());
    const history = await loadHistory();
    expect(history).toHaveLength(1);
    expect(history[0].doctorInput).toBe('继续治疗两周');
    expect(history[0].scenarioType).toBe('安抚');
  });

  it('stores all three reply versions', async () => {
    await saveToHistory(makeHistory());
    const history = await loadHistory();
    expect(history[0].replies.versionA).toBe('A内容');
    expect(history[0].replies.versionB).toBe('B内容');
    expect(history[0].replies.versionC).toBe('C内容');
  });

  it('differentiates api vs mock mode', async () => {
    await saveToHistory(makeHistory({ mode: 'mock' }));
    // Small delay so timestamps differ reliably in fake-indexeddb
    await new Promise(r => setTimeout(r, 10));
    await saveToHistory(makeHistory({ mode: 'api' }));
    const history = await loadHistory();
    // Both exist, order may vary in fake-indexeddb
    const modes = history.map(h => h.mode);
    expect(modes).toContain('api');
    expect(modes).toContain('mock');
    expect(history).toHaveLength(2);
  });

  it('caps history at 20 records', async () => {
    for (let i = 0; i < 25; i++) {
      await saveToHistory(makeHistory({ doctorInput: `治疗 ${i}` }));
      await new Promise(r => setTimeout(r, 10));
    }
    const history = await loadHistory();
    expect(history).toHaveLength(20);
    // Most recent should be first (reverse timestamp order)
    expect(history[0].doctorInput).toBe('治疗 24');
  });

  it('deletes a single history item', async () => {
    const result = await saveToHistory(makeHistory({ doctorInput: '删除我' }));
    const id = result[0].id;
    await deleteHistoryItem(id);
    const history = await loadHistory();
    expect(history).toHaveLength(0);
  });

  it('clears all history', async () => {
    await saveToHistory(makeHistory());
    await saveToHistory(makeHistory({ doctorInput: '另一条' }));
    await clearAllHistory();
    const history = await loadHistory();
    expect(history).toHaveLength(0);
  });

  it('records have id and timestamp', async () => {
    const result = await saveToHistory(makeHistory());
    expect(result[0].id).toBeTruthy();
    expect(result[0].timestamp).toBeGreaterThan(0);
    expect(result[0].timestamp).toBeLessThanOrEqual(Date.now());
  });
});

describe('IndexedDB template operations', () => {
  beforeEach(async () => {
    // Clean up by deleting all templates
    const templates = await loadTemplates();
    for (const t of templates) {
      await deleteTemplateItem(t.id);
    }
  });

  it('starts with empty templates', async () => {
    const templates = await loadTemplates();
    expect(templates).toEqual([]);
  });

  it('saves and loads templates', async () => {
    await saveTemplate(makeTemplate());
    const templates = await loadTemplates();
    expect(templates).toHaveLength(1);
    expect(templates[0].name).toBe('测试模板');
    expect(templates[0].doctorInput).toBe('继续治疗');
  });

  it('stores scenario type in template', async () => {
    await saveTemplate(makeTemplate({ scenarioType: '术后焦虑' }));
    const templates = await loadTemplates();
    expect(templates[0].scenarioType).toBe('术后焦虑');
  });

  it('deletes a template', async () => {
    const result = await saveTemplate(makeTemplate({ name: '删除模板' }));
    const id = result[0].id;
    await deleteTemplateItem(id);
    const templates = await loadTemplates();
    expect(templates).toHaveLength(0);
  });

  it('saves multiple templates', async () => {
    await saveTemplate(makeTemplate({ name: '模板A' }));
    await saveTemplate(makeTemplate({ name: '模板B' }));
    await saveTemplate(makeTemplate({ name: '模板C' }));
    const templates = await loadTemplates();
    expect(templates).toHaveLength(3);
  });
});