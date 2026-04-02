/**
 * Serper.dev Web Search Service
 * Searches Google with site:twitter.com or site:x.com
 */

import { SERPER_API_KEY, SERPER_SEARCH_URL } from './config';

export interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  position: number;
}

const TIME_FILTERS: Record<string, string> = {
  "24h": "qdr:d",
  "7d": "qdr:w",
  "30d": "qdr:m",
  "any": "",
};

/**
 * Search Twitter via Google (site:twitter.com or site:x.com)
 */
export async function searchTwitter(
  query: string,
  options: {
    num?: number;
    timeFilter?: string;
  } = {},
): Promise<SerperResult[]> {
  if (!SERPER_API_KEY) {
    throw new Error('Serper API key not configured');
  }

  const fullQuery = `${query} (site:twitter.com OR site:x.com) -filter:retweets`;
  const body: Record<string, unknown> = {
    q: fullQuery,
    num: options.num || 10,
    gl: "us",
    hl: "en",
  };

  // Apply time filter
  const tbs = TIME_FILTERS[options.timeFilter || "7d"];
  if (tbs) body.tbs = tbs;

  const res = await fetch(SERPER_SEARCH_URL, {
    method: 'POST',
    headers: {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Serper API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return (data.organic || []).map((item: Record<string, unknown>, i: number) => ({
    title: item.title as string,
    link: item.link as string,
    snippet: item.snippet as string,
    date: item.date as string | undefined,
    position: i + 1,
  }));
}

/**
 * Extract tweet ID from Twitter/X URL
 */
export function extractTweetId(url: string): string | null {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Normalize Twitter/X URLs
 */
export function normalizeTweetUrl(url: string): string | null {
  // Convert x.com to twitter.com for consistency
  return url.replace('x.com', 'twitter.com');
}
