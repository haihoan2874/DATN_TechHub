export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8089';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${API_ORIGIN}/api/v1`;

export const resolveApiAssetUrl = (url, fallback = '/logo_final.png') => {
  if (!url) return fallback;
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
};

export const optimizeImageUrl = (url, width = 'auto') => {
  const resolvedUrl = resolveApiAssetUrl(url);
  if (resolvedUrl.includes('res.cloudinary.com') && resolvedUrl.includes('/upload/')) {
    const transformation = width === 'auto' ? 'q_auto,f_auto' : `w_${width},c_limit,q_auto,f_auto`;
    return resolvedUrl.replace('/upload/', `/upload/${transformation}/`);
  }
  return resolvedUrl;
};

export const getOAuthUrl = (provider = 'google') => `${API_ORIGIN}/oauth2/authorization/${provider}`;
