import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useLogin } from '../../hooks/auth/useLogin';

import { FaEye, FaEyeSlash, FaLock, FaEnvelope } from 'react-icons/fa';
import { MdErrorOutline } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const loginSchema = z.object({
  email: z.string().email('Digite um email válido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
        <div className="px-8 pt-8 pb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Bem-vindo ao SIGA+
          </h1>

          <p className="text-gray-500">
            Entre para acessar o painel acadêmico.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    setLoginError('');
    loginMutation.mutate(data, {
      onSuccess: () => navigate('/dashboard', { replace: true }),
      onError: (error: AxiosError) => {
      console.error(error);

      if (error.response?.status === 401) {
        setLoginError('Email ou senha incorretos.');
        return;
      }

      if (error.response?.status === 403) {
        setLoginError('Você não tem permissão para acessar o sistema.');
        return;
      }

      if (!error.response) {
        setLoginError(
          'Não foi possível conectar com a API. Verifique se o backend está rodando.'
        );
        return;
      }

        setLoginError('Erro ao fazer login. Tente novamente.');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-8 pb-8">
      {loginError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <MdErrorOutline size={18} />
          <span>{loginError}</span>
        </div>
      )}

      <div className="space-y-1">
        <label className="ml-1 text-sm font-semibold text-gray-700">
          Email
        </label>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <FaEnvelope />
          </div>

          <input
            type="email"
            placeholder="seu@email.com"
            className={`w-full rounded-xl border bg-white py-3 pr-4 pl-10 text-gray-900 placeholder:text-gray-400 transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300'
            }`}
            {...register('email')}
          />
        </div>

        {errors.email && (
          <span className="ml-1 text-xs text-red-500">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <label className="ml-1 text-sm font-semibold text-gray-700">
          Senha
        </label>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <FaLock />
          </div>

          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Digite sua senha"
            className={`w-full rounded-xl border bg-white py-3 pr-12 pl-10 text-gray-900 placeholder:text-gray-400 transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300'
            }`}
            {...register('password')}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        </div>

        {errors.password && (
          <span className="ml-1 text-xs text-red-500">
            {errors.password.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loginMutation.isPending ? (
          <>
            <AiOutlineLoading3Quarters className="animate-spin" />
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </button>

      <p className="text-center text-xs text-gray-500">
        O acesso é restrito a usuários cadastrados pela secretaria.
      </p>
    </form>
  );
}

export default Login;
