const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

let accessToken: string | null = null;

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export const getAccessToken = () => accessToken;
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user: User | null) => {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

export const getStoredRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
};

export const setStoredRefreshToken = (token: string | null) => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('refresh_token', token);
  } else {
    localStorage.removeItem('refresh_token');
  }
};

// Custom apiFetch wrapper that auto-injects auth header and handles token refreshing
export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${BACKEND_URL}${endpoint}`;
  
  // Prepare headers
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401 || response.status === 403) {
    // Attempt token refresh
    const refreshed = await performTokenRefresh();
    if (refreshed) {
      // Retry the original request
      headers.set('Authorization', `Bearer ${accessToken}`);
      const retryResponse = await fetch(url, { ...options, headers });
      return handleResponse(retryResponse);
    } else {
      // Force logout if refresh failed
      handleForceLogout();
    }
  }

  return handleResponse(response);
};

const handleResponse = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw {
      status: response.status,
      error: data.error || { message: 'Something went wrong' }
    };
  }
  return data;
};

const performTokenRefresh = async (): Promise<boolean> => {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!res.ok) throw new Error();

    const result = await res.json();
    if (result.success && result.data.access_token) {
      setAccessToken(result.data.access_token);
      setStoredRefreshToken(result.data.refresh_token);
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};

const handleForceLogout = () => {
  setAccessToken(null);
  setStoredRefreshToken(null);
  setStoredUser(null);
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};
