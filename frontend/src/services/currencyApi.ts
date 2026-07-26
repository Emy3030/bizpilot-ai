import { api } from './apiClient';
import { CurrencyRatesResponse } from '@/types/currency';

interface ItemResponse<T> {
  success: true;
  data: T;
}

export const currencyApi = {
  async getRates(target: string): Promise<CurrencyRatesResponse> {
    const { data } = await api.get<ItemResponse<CurrencyRatesResponse>>('/currency/rates', { params: { target } });
    return data.data;
  },
};
