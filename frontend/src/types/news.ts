export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  source: string;
  publishedAt: string;
}

export interface NewsResponse {
  configured: boolean;
  articles: NewsArticle[];
}
