import { API_CONFIG } from './config';

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
  const response = await fetch(`${API_CONFIG.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
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

  const reader = response.body?.getReadableStream().getReader();
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
