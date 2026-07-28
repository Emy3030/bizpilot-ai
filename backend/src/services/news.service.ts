import { env } from '../config/env';

export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  source: string;
  publishedAt: string;
}

interface GNewsArticle {
  title: string;
  description: string;
  content?: string;
  url: string;
  image?: string;
  publishedAt: string;
  source?: { name?: string };
}

// GNews top-headlines supports these categories. We deliberately skip
// 'sports' and 'entertainment' as less relevant to a business-owner feed —
// 7 categories × 10 articles (the free-tier max per request) gets us past
// 60 articles before de-duplication.
const CATEGORIES = ['business', 'technology', 'general', 'world', 'science', 'health', 'nation'];
const MAX_PER_CATEGORY = 10;

async function fetchCategory(category: string): Promise<GNewsArticle[]> {
  const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=${MAX_PER_CATEGORY}&apikey=${env.newsApiKey}`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error(`[News] GNews request failed for category "${category}":`, response.status);
      return [];
    }
    const data = (await response.json()) as { articles?: GNewsArticle[] };
    return data.articles || [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[News] Failed to fetch category "${category}":`, error);
    return [];
  }
}

export const newsService = {
  isConfigured(): boolean {
    return !!env.newsApiKey;
  },

  /**
   * Fetches business-relevant headlines from GNews.io (free tier: 100
   * requests/day, no credit card required — https://gnews.io) across
   * several categories in parallel, de-duplicated and sorted by recency.
   * Costs CATEGORIES.length requests per call — see the quota note in the
   * delivery notes if you need to tune this down.
   * Never throws: returns an empty array if unconfigured or every request
   * fails, so the frontend can fall back to its sample content.
   */
  async getBusinessHeadlines(): Promise<NewsArticle[]> {
    if (!env.newsApiKey) return [];

    const results = await Promise.all(CATEGORIES.map(fetchCategory));
    const allArticles = results.flat();

    const seen = new Set<string>();
    const deduped = allArticles.filter((a) => {
      if (!a.url || seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

    deduped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return deduped.map((a) => ({
      title: a.title,
      description: a.description,
      content: a.content || a.description,
      url: a.url,
      image: a.image || null,
      source: a.source?.name || 'Unknown source',
      publishedAt: a.publishedAt,
    }));
  },
};
