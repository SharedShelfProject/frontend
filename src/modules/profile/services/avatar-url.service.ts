import { API_BASE_PATH } from '@/constants/api.constants';

const BROKEN_APP_URL_PREFIX = /^(undefined|null)(?=\/uploads\/)/i;

export function resolveAvatarUrl(avatarUrl: string | null | undefined, refreshKey: number) {
  if (!avatarUrl) {
    return '';
  }

  const normalizedAvatarUrl = avatarUrl.trim().replace(BROKEN_APP_URL_PREFIX, '');
  const baseUrl = /^https?:\/\//i.test(normalizedAvatarUrl)
    ? normalizedAvatarUrl
    : `${API_BASE_PATH}${normalizedAvatarUrl.startsWith('/') ? '' : '/'}${normalizedAvatarUrl}`;

  return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}v=${refreshKey}`;
}
