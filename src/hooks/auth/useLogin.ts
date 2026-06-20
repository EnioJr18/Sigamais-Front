import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { api } from '../../services/api';
import { clearToken, setToken } from '../../services/auth';

interface LoginUserData {
  email: string;
  password: string;
}

async function loginUser(data: LoginUserData) {
  // Um JWT antigo nunca deve acompanhar a requisição pública de login.
  clearToken();

  const response = await api.post('/auth/login', {
    email: data.email,
    senha: data.password,
  });

  return response.data as { token: string };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<{ token: string }, AxiosError, LoginUserData>({
    mutationFn: loginUser,
    onSuccess: data => {
      setToken(data.token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
