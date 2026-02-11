export type Provider = 'openai' | 'anthropic' | 'gemini';

export interface ProviderConfig {
  basePath: string;
  endpoint: string;
  installNode: string;
  installPython: string;
}

export const PROVIDER_CONFIG: Record<Provider, ProviderConfig> = {
  openai: {
    basePath: '/v1',
    endpoint: '/chat/completions',
    installNode: 'npm install openai',
    installPython: 'pip install openai',
  },
  anthropic: {
    basePath: '/v1',
    endpoint: '/messages',
    installNode: 'npm install @anthropic-ai/sdk',
    installPython: 'pip install anthropic',
  },
  gemini: {
    basePath: '/v1beta',
    endpoint: '/models/gemini-pro:generateContent',
    installNode: 'npm install @google/generative-ai',
    installPython: 'pip install google-generativeai',
  },
};
