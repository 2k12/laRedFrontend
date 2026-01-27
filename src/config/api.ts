const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
// Ensure the URL is absolute by checking for http/https
export const API_BASE_URL = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
