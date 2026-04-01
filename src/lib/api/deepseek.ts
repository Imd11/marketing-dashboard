import { PROVIDERS } from './config';
import { useApiProviderStore } from './useApiProviderStore';

export interface GenerateParams {
  systemPrompt: string;
  productName: string;
  rawThoughts: string;
}

function buildUserPrompt(params: GenerateParams): string {
  return `产品名称: ${params.productName}
原始想法: ${params.rawThoughts}`;
}

export async function streamGenerate(
  params: GenerateParams,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const provider = useApiProviderStore.getState().provider;
  const config = PROVIDERS[provider];

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: buildUserPrompt(params) },
      ],
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('无法读取响应流');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              onChunk(delta);
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
