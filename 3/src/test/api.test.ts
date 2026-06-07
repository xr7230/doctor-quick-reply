import { describe, it, expect } from 'vitest';
import { getCurlCommand, testConnection } from '../api';

describe('getCurlCommand', () => {
  it('generates valid curl command with masked key', () => {
    const cmd = getCurlCommand('https://api.deepseek.com/v1', 'sk-1234567890abcdef1234567890abcdef');
    expect(cmd).toContain('curl');
    expect(cmd).toContain('https://api.deepseek.com/v1/chat/completions');
    expect(cmd).toContain('Authorization: Bearer');
    expect(cmd).toContain('sk-12345...cdef'); // masked key
    expect(cmd).not.toContain('sk-1234567890abcdef1234567890abcdef'); // full key hidden
  });

  it('strips trailing slash from base URL', () => {
    const cmd = getCurlCommand('https://api.example.com/v1/', 'sk-test');
    expect(cmd).toContain('https://api.example.com/v1/chat/completions');
    expect(cmd).not.toContain('//chat');
  });

  it('handles short API keys', () => {
    const cmd = getCurlCommand('https://api.test.com', 'sk-short');
    expect(cmd).toContain('sk-short...hort');
  });
});

describe('testConnection pre-flight validation', () => {
  it('rejects empty API key', async () => {
    const result = await testConnection('https://api.test.com/v1', '', 'DeepSeek');
    expect(result.success).toBe(false);
    expect(result.details?.errorType).toBe('format');
  });

  it('rejects API key not starting with sk-', async () => {
    const result = await testConnection('https://api.test.com/v1', 'bad-key-1234567890', 'DeepSeek');
    expect(result.success).toBe(false);
    expect(result.details?.errorType).toBe('format');
  });

  it('rejects short API key', async () => {
    const result = await testConnection('https://api.test.com/v1', 'sk-short', 'DeepSeek');
    expect(result.success).toBe(false);
    expect(result.details?.errorType).toBe('format');
  });

  it('rejects empty base URL', async () => {
    const result = await testConnection('', 'sk-1234567890abcdef123456', 'DeepSeek');
    expect(result.success).toBe(false);
    expect(result.details?.errorType).toBe('format');
  });

  it('rejects non-http base URL', async () => {
    const result = await testConnection('ftp://api.test.com', 'sk-1234567890abcdef123456', 'DeepSeek');
    expect(result.success).toBe(false);
    expect(result.details?.errorType).toBe('format');
  });

  it('passes format validation for valid inputs', async () => {
    // Will likely fail on network, but shouldn't fail on format checks
    const result = await testConnection('https://api.deepseek.com/v1', 'sk-1234567890abcdef123456', 'DeepSeek');
    // It will either be a network error or a connection error, but NOT a format error
    expect(result.details?.errorType).not.toBe('format');
  });
});