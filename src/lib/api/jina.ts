/**
 * Jina Reader API
 * Converts any URL to clean text suitable for LLM processing
 * Free tier: 10M tokens without API key
 * Endpoint: https://r.jina.ai/{url}
 */

const JINA_API_KEY = import.meta.env.VITE_JINA_API_KEY || '';

export async function scrapeUrl(url: string): Promise<string> {
  const jinaUrl = `https://r.jina.ai/${url}`;

  const headers: Record<string, string> = {
    Accept: 'text/plain',
  };

  if (JINA_API_KEY) {
    headers['Authorization'] = `Bearer ${JINA_API_KEY}`;
  }

  const res = await fetch(jinaUrl, { headers });

  if (!res.ok) {
    throw new Error(`Jina scrape failed for ${url}: ${res.status}`);
  }

  const text = await res.text();
  // 截取前 4000 字符，控制 AI 输入成本
  return text.slice(0, 4000);
}
