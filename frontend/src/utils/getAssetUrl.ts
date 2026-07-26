import { API_BASE_URL } from '@/services/apiClient';

// API_BASE_URL looks like http://localhost:5000/api/v1 — assets are served
// from the server root (http://localhost:5000/uploads/...), so strip the API suffix.
const SERVER_ROOT = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export function getAssetUrl(relativePath: string | null | undefined): string | null {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  return `${SERVER_ROOT}${relativePath}`;
}
