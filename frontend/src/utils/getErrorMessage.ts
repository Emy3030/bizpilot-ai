import { AxiosError } from 'axios';
import { ApiFailure } from '@/types/auth';

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiFailure | undefined;
    if (data?.details?.length) {
      return data.details.map((d) => d.message).join('. ');
    }
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
