export interface CurrencyRate {
  currency: string;
  rateToTarget: number;
}

export interface CurrencyRatesResponse {
  available: boolean;
  target: string;
  rates: CurrencyRate[];
  fetchedAt?: string;
}
