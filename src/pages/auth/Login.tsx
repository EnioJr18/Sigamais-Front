import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import {
  Activity,
  BookOpenCheck,
  BrainCircuit,
  Eye,
  EyeOff,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useLogin } from '../../hooks/auth/useLogin';

const loginSchema = z.object({
  email: z.string().email('Digite um email válido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const highlights = [
  { icon: GraduationCap, label: 'Gestão acadêmica' },
  { icon: BookOpenCheck, label: 'Notas e frequência' },
  { icon: ShieldAlert, label: 'Alertas de risco' },
  { icon: BrainCircuit, label: 'Acompanhamento inteligente' },
];

function Login() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white px-4 py-8 sm:px-6 lg:grid lg:place-items-center lg:py-12">
      <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-[#EAF3FF] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-[#FFF3E8] blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_90px_-38px_rgba(15,74,138,0.45)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden bg-[#1557A6] px-6 py-9 text-white sm:px-10 sm:py-12 lg:flex lg:min-h-[42rem] lg:flex-col lg:justify-between lg:px-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[42px] border-white/5" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#F47C20]/20 blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-lg font-black text-[#1557A6] shadow-lg">
                S+
              </span>
              <div>
                <p className="text-xl font-bold tracking-tight">SIGA+</p>
                <p className="text-xs text-blue-100">
                  Sistema Inteligente de Gestão Acadêmica
                </p>
              </div>
            </div>

            <h1 className="mt-10 max-w-lg text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:mt-16 lg:text-5xl">
              A vida acadêmica mais clara, conectada e inteligente.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
              Acesse sua conta para acompanhar a vida acadêmica, gerenciar
              turmas e monitorar alertas de risco.
            </p>
          </div>

          <div className="relative mt-9 grid gap-3 sm:grid-cols-2 lg:mt-12">
            {highlights.map(item => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F47C20] text-white shadow-md shadow-orange-950/15">
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-white">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
          <div className="mx-auto w-full max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF3E8] px-3 py-1.5 text-xs font-semibold text-[#D96512]">
              <Activity className="h-3.5 w-3.5" />
              Ambiente acadêmico seguro
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
              Bem-vindo ao SIGA+
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sistema Inteligente de Gestão Acadêmica
            </p>

            <LoginForm />
          </div>
        </section>
      </div>
    </main>
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
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (data: LoginFormData) => {
    setLoginError('');
    loginMutation.mutate(data, {
      onSuccess: () => navigate('/dashboard', { replace: true }),
      onError: (error: AxiosError) => {
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
            'Não foi possível conectar com a API. Verifique se o backend está rodando.',
          );
          return;
        }
        setLoginError('Erro ao fazer login. Tente novamente.');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
      {loginError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{loginError}</span>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="login-email" className="text-sm font-semibold text-slate-700">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            className={`h-12 w-full rounded-xl border bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1557A6] focus:ring-4 focus:ring-[#EAF3FF] ${errors.email ? 'border-red-400' : 'border-slate-300'}`}
            {...register('email')}
          />
        </div>
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="login-password" className="text-sm font-semibold text-slate-700">
          Senha
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Digite sua senha"
            className={`h-12 w-full rounded-xl border bg-white pl-10 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1557A6] focus:ring-4 focus:ring-[#EAF3FF] ${errors.password ? 'border-red-400' : 'border-slate-300'}`}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(current => !current)}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 transition hover:text-[#1557A6]"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1557A6] px-5 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#0F4A8A] focus:outline-none focus:ring-4 focus:ring-[#EAF3FF] disabled:cursor-not-allowed disabled:opacity-65"
      >
        {loginMutation.isPending ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          'Entrar no SIGA+'
        )}
      </button>

      <p className="text-center text-xs leading-5 text-slate-500">
        O acesso é restrito a usuários cadastrados pela instituição.
      </p>
    </form>
  );
}

export default Login;
