export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8089';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${API_ORIGIN}/api/v1`;

export const resolveApiAssetUrl = (url, fallback = '/logo_final.png') => {
  if (!url) return fallback;
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
};

export const getOAuthUrl = (provider = 'google') => `${API_ORIGIN}/oauth2/authorization/${provider}`;
