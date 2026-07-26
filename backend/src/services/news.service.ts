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

export const newsService = {
  isConfigured(): boolean {
    return !!env.newsApiKey;
  },

  /**
   * Fetches business headlines from GNews.io (free tier: 100 requests/day,
   * no credit card required — https://gnews.io). Never throws: returns an
   * empty array if unconfigured or the request fails, so the frontend can
   * fall back to its sample content instead of showing an error.
   */
  async getBusinessHeadlines(limit = 5): Promise<NewsArticle[]> {
    if (!env.newsApiKey) return [];

    const url = `https://gnews.io/api/v4/top-headlines?category=business&lang=en&max=${limit}&apikey=${env.newsApiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.error('[News] GNews request failed:', response.status, await response.text());
        return [];
      }

      const data = (await response.json()) as { articles?: GNewsArticle[] };
      return (data.articles || []).map((a) => ({
        title: a.title,
        description: a.description,
        content: a.content || a.description,
        url: a.url,
        image: a.image || null,
        source: a.source?.name || 'Unknown source',
        publishedAt: a.publishedAt,
      }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[News] Failed to fetch headlines:', error);
      return [];
    }
  },
};
