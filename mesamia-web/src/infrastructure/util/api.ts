import { auth } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const getHeaders = () => {
  const headers: any = { 'Content-Type': 'application/json' };
  const token = auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (res: Response) => {
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    if (res.status === 401) {
      auth.logout();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    const error = (data && data.message) || 'API Error';
    throw new Error(error);
  }

  return data;
};

export const api = {
  async get(path: string) {
    const res = await fetch(`${API_URL}${path}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  async post(path: string, body: any) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
  async patch(path: string, body: any) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
  async delete(path: string) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
