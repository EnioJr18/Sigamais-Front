import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { api } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaUser } from 'react-icons/fa';
import { MdCheckCircle, MdErrorOutline } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const loginSchema = z.object({
  email: z.string().email('Digite um email válido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

const registerSchema = z
  .object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Digite um email válido'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    passwordConfirmation: z.string(),
  })
  .refine(data => data.password === data.passwordConfirmation, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirmation'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

type AuthMode = 'login' | 'register';

function Login() {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
        <div className="px-8 pt-8 pb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {mode === 'login' ? 'Bem-vindo!' : 'Crie sua conta'}
          </h1>
          <p className="text-gray-500">
            {mode === 'login'
              ? 'Faça login para continuar suas compras.'
              : 'Preencha seus dados para começar.'}
          </p>
        </div>

        <div className="px-8 pb-2">
          <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`rounded-lg py-2 text-sm font-semibold transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`rounded-lg py-2 text-sm font-semibold transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500'
              }`}
            >
              Registrar
            </button>
          </div>
        </div>

        {mode === 'login' ? (
          <LoginForm onGoToRegister={() => setMode('register')} />
        ) : (
          <RegisterForm onGoToLogin={() => setMode('login')} />
        )}
      </div>
    </div>
  );
}

function LoginForm({ onGoToRegister }: { onGoToRegister: () => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      setLoginError('');
      const response = await api.post('/sessions', data);
      return response.data;
    },
    onSuccess: data => {
      localStorage.setItem('token', data.token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/dashboard');
    },
    onError: (error: AxiosError) => {
      console.error(error);
      setLoginError('Email ou senha incorretos. Tente novamente.');
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-8 pb-8">
      {loginError && (
        <div className="flex animate-pulse items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
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
        <div className="ml-1 flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">Senha</label>

          <Link to="#" className="text-xs text-blue-600 hover:underline">
            Esqueceu a senha?
          </Link>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <FaLock />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="********"
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

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">ou</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onGoToRegister}
        className="w-full rounded-xl border border-gray-200 bg-white py-3.5 font-semibold text-gray-800 transition-colors hover:bg-gray-50"
      >
        Criar nova conta
      </button>
    </form>
  );
}

function RegisterForm({ onGoToLogin }: { onGoToLogin: () => void }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setRegisterError('');
    setSuccessMsg('');
    setIsPending(true);

    try {
      await api.post('/users', data);
      setSuccessMsg('Conta criada com sucesso! Redirecionando...');

      setTimeout(() => {
        setIsPending(false);
        onGoToLogin();
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error(error);
      const axiosError = error as AxiosError<{ message?: string }>;
      const msg =
        axiosError.response?.data?.message ||
        'Erro ao criar conta. Tente novamente.';
      setRegisterError(msg);
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-8 pb-8">
      {registerError && (
        <div className="flex animate-pulse items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <MdErrorOutline size={18} />
          <span>{registerError}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-600">
          <MdCheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="space-y-1">
        <label className="ml-1 text-sm font-semibold text-gray-700">
          Nome Completo
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <FaUser />
          </div>
          <input
            placeholder="Seu nome"
            className={`w-full rounded-xl border bg-white py-3 pr-4 pl-10 text-gray-900 placeholder:text-gray-400 transition-all outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            {...register('name')}
          />
        </div>
        {errors.name && (
          <span className="ml-1 text-xs text-red-500">
            {errors.name.message}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <label className="ml-1 text-sm font-semibold text-gray-700">
          Email
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <FaEnvelope />
          </div>
          <input
            placeholder="seu@email.com"
            className={`w-full rounded-xl border bg-white py-3 pr-4 pl-10 text-gray-900 placeholder:text-gray-400 transition-all outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
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
            placeholder="Mínimo 6 caracteres"
            className={`w-full rounded-xl border bg-white py-3 pr-12 pl-10 text-gray-900 placeholder:text-gray-400 transition-all outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.password && (
          <span className="ml-1 text-xs text-red-500">
            {errors.password.message}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <label className="ml-1 text-sm font-semibold text-gray-700">
          Confirmar Senha
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <FaLock />
          </div>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repita a senha"
            className={`w-full rounded-xl border bg-white py-3 pr-12 pl-10 text-gray-900 placeholder:text-gray-400 transition-all outline-none focus:ring-2 focus:ring-blue-500 ${errors.passwordConfirmation ? 'border-red-500' : 'border-gray-300'}`}
            {...register('passwordConfirmation')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.passwordConfirmation && (
          <span className="ml-1 text-xs text-red-500">
            {errors.passwordConfirmation.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? (
          <>
            <AiOutlineLoading3Quarters className="animate-spin" />
            Cadastrando...
          </>
        ) : (
          'Criar Conta'
        )}
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Já tem uma conta?</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onGoToLogin}
        className="w-full rounded-xl border border-gray-200 bg-white py-3.5 font-semibold text-blue-900 transition-colors hover:bg-gray-50"
      >
        Fazer Login
      </button>
    </form>
  );
}

export default Login;
