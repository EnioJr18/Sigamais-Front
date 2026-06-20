import axios from 'axios';

import { clearToken, getToken } from './auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  const isLoginRequest = config.url === '/auth/login';

  if (token && !isLoginRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    const isLoginRequest = error.config?.url === '/auth/login';

    if (error.response?.status === 401 && !isLoginRequest) {
      clearToken();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return Promise.reject(error);
  },
);
