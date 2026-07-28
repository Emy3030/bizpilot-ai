export interface CurrencyRate {
  currency: string;
  /** 1 unit of `currency` equals this many units of the target currency. */
  rateToTarget: number;
}

export interface CurrencyRatesResult {
  target: string;
  rates: CurrencyRate[];
  fetchedAt: string;
}

const MAJOR_CURRENCIES = ['USD', 'GBP', 'EUR'];

export const currencyService = {
  /**
   * Fetches live exchange rates from open.er-api.com — genuinely free, no
   * API key or signup required. Returns null (never throws) if the target
   * currency isn't recognized or the request fails, so the frontend can
   * show a clear "unavailable right now" state instead of an error.
   */
  async getRates(targetCurrency: string): Promise<CurrencyRatesResult | null> {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(9000) });
      if (!response.ok) return null;

      const data = (await response.json()) as {
        result: string;
        rates?: Record<string, number>;
        time_last_update_utc?: string;
      };

      if (data.result !== 'success' || !data.rates) return null;

      const target = targetCurrency.toUpperCase();
      const targetRate = data.rates[target];
      if (!targetRate) return null;

      const rates = MAJOR_CURRENCIES.filter((c) => c !== target && data.rates![c]).map((c) => ({
        currency: c,
        // data.rates is base=USD, so "1 USD = data.rates[c] c" — invert/scale
        // to express everything as "1 <major currency> = X <target currency>"
        rateToTarget: c === 'USD' ? targetRate : targetRate / data.rates![c],
      }));

      return {
        target,
        rates,
        fetchedAt: data.time_last_update_utc || new Date().toISOString(),
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Currency] Failed to fetch rates:', error);
      return null;
    }
  },
};
