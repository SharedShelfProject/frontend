const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!rawApiBaseUrl || !rawApiBaseUrl.trim()) {
  throw new Error('VITE_API_BASE_URL is not set');
}

const normalizedApiBaseUrl = rawApiBaseUrl.trim();

export const API_BASE_PATH = normalizedApiBaseUrl.endsWith('/')
  ? normalizedApiBaseUrl.slice(0, -1)
  : normalizedApiBaseUrl;
