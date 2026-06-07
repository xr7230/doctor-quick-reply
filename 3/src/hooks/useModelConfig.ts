import { useState, useEffect } from 'react';
import { ModelConfig, ApiModeStatus, BannerInfo } from '../types';

const STORAGE_KEY = 'medical-communication-assistant-config';

const defaultConfig: ModelConfig = {
  vendor: 'DeepSeek',
  apiKey: '',
  baseUrl: 'https://api.deepseek.com/v1/chat/completions',
  enabled: false,
};

export const useModelConfig = () => {
  const [config, setConfig] = useState<ModelConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [apiModeStatus, setApiModeStatus] = useState<ApiModeStatus>('unconfigured');
  const [banner, setBanner] = useState<BannerInfo | null>(null);
  const [apiModeEnabled, setApiModeEnabled] = useState(true);

  useEffect(() => {
    try {
      const storedConfig = localStorage.getItem(STORAGE_KEY);
      if (storedConfig) {
        const parsed = JSON.parse(storedConfig);
        setConfig(parsed);
        if (parsed.apiKey && parsed.enabled && parsed.apiKey.trim() !== '') {
          setApiModeStatus('configured');
          setApiModeEnabled(true);
        }
      }
    } catch (error) {
      console.error('Failed to load config from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveConfig = (newConfig: ModelConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
      if (newConfig.apiKey && newConfig.apiKey.trim() !== '' && newConfig.enabled) {
        setApiModeStatus('configured');
        setApiModeEnabled(true);
      }
    } catch (error) {
      console.error('Failed to save config to localStorage:', error);
    }
  };

  const clearConfig = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setConfig(defaultConfig);
    } catch (error) {
      console.error('Failed to clear config from localStorage:', error);
    }
  };

  const disableApiMode = () => {
    setApiModeEnabled(false);
    setApiModeStatus('unconfigured');
  };

  const enableApiMode = () => {
    if (config.apiKey && config.enabled) {
      setApiModeEnabled(true);
      setApiModeStatus('configured');
    }
  };

  const showBanner = (bannerInfo: BannerInfo) => {
    setBanner(bannerInfo);
    if (bannerInfo.type !== 'info') {
      setTimeout(() => setBanner(null), 5000);
    }
  };

  const clearBanner = () => {
    setBanner(null);
  };

  return {
    config,
    saveConfig,
    clearConfig,
    isLoading,
    apiModeStatus,
    setApiModeStatus,
    banner,
    showBanner,
    clearBanner,
    apiModeEnabled,
    setApiModeEnabled,
    disableApiMode,
    enableApiMode,
  };
};