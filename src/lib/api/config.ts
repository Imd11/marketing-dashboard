export type ApiProvider = 'deepseek' | 'minimax';

export interface ProviderConfig {
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string;
}

export const PROVIDERS: Record<ApiProvider, ProviderConfig> = {
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    apiKey: 'sk-0472bbc337b747eab9cf7e1bd703a012',
  },
  minimax: {
    name: 'MiniMax',
    baseUrl: 'https://api.minimaxi.com/v1',
    model: 'MiniMax-M2.7',
    apiKey: 'sk-cp-3yW4qZ7ProViJUTrLLzxaSUP_mL35AlViXwA2-ImPrRl1tKEI8zRg1tziospPuorTQ8YmU_fXnamTalbjqtjo76BYGBDPm8wdvBtzZuCkd78ndrTshX2In8',
  },
};

export const DEFAULT_PROVIDER: ApiProvider = 'deepseek';
