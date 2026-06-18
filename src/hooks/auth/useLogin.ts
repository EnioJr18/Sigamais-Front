import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '../../services/api';

interface LoginUserData {
  email: string;
  password: string;
}

async function loginUser(data: LoginUserData) {
  const response = await api.post('/auth/login', {
    email: data.email,
    senha: data.password,
  });

  return response.data as { token: string };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: data => {
      localStorage.setItem('token', data.token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
