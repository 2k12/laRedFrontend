const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // Use fallback if environment variable is missing or empty
  if (!envUrl || envUrl === 'undefined' || envUrl === '') {
    return 'http://localhost:3001';
  }
  
  let trimmed = envUrl.trim();
  
  // Remove literal quotes if present
  trimmed = trimmed.replace(/^["']|["']$/g, "");
  
  // Remove trailing slash if present
  trimmed = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;

  // Ensure absolute URL with protocol
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  return `https://${trimmed}`;
};

export const API_BASE_URL = getApiUrl();
