// API configuration
export const API_BASE_URL = 'http://localhost:3000/api';

// Ensure URL always has trailing slash and is properly formatted
export const getApiUrl = (path: string): string => {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}${cleanPath}`;
};