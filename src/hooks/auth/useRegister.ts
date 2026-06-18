import { useMutation } from '@tanstack/react-query';

import { api } from '../../services/api';

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

async function registerUser(data: RegisterUserData) {
  const response = await api.post('/users', data);
  return response.data;
}

export function useRegister() {
  return useMutation({ mutationFn: registerUser });
}
