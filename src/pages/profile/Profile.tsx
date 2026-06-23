import { useEffect, useState, type ReactNode } from 'react';

import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, KeyRound, Save, ShieldCheck, UserRound } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FeedbackBanner, FormField, InlineError, type Feedback } from '@/components/entities/CrudElements';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getApiErrorMessage } from '@/services/http';
import {
  alterarMinhaSenha,
  atualizarMeuPerfil,
  getMeuPerfil,
  type AlterarSenhaPayload,
  type AtualizarPerfilPayload,
} from '@/services/profileService';

const profileSchema = z.object({
  nome: z.string().trim().min(2, 'Informe seu nome.'),
  telefone: z.string().trim().max(20, 'Use no máximo 20 caracteres.'),
  endereco: z.string().trim().max(180, 'Use no máximo 180 caracteres.'),
  fotoPerfilUrl: z.union([
    z.literal(''),
    z.string().trim().url('Informe uma URL válida.'),
  ]),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    senhaAtual: z.string().min(1, 'Informe sua senha atual.'),
    novaSenha: z
      .string()
      .min(1, 'Informe a nova senha.')
      .min(6, 'A nova senha deve ter no mínimo 6 caracteres.'),
    confirmarNovaSenha: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine(data => data.novaSenha === data.confirmarNovaSenha, {
    message: 'A confirmação deve ser igual à nova senha.',
    path: ['confirmarNovaSenha'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

function getPasswordErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return 'Não foi possível alterar a senha.';
  }

  if (!error.response) {
    return 'Não foi possível conectar à API.';
  }

  const data = error.response.data as
    | string
    | {
        message?: string;
        mensagem?: string;
        erro?: string;
        error?: string;
        detail?: string;
      }
    | undefined;
  const backendMessage =
    typeof data === 'string'
      ? data.trim()
      : data?.message ??
        data?.mensagem ??
        data?.erro ??
        data?.error ??
        data?.detail;

  switch (error.response.status) {
    case 400:
      return (
        backendMessage || 'Dados inválidos. Confira as senhas informadas.'
      );
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    case 403:
      return 'Você não tem permissão para alterar esta senha.';
    default:
      return 'Não foi possível alterar a senha.';
  }
}

function Profile() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback | null>(null);
  const profileQuery = useQuery({ queryKey: ['meu-perfil'], queryFn: getMeuPerfil });
  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { nome: '', telefone: '', endereco: '', fotoPerfilUrl: '' },
  });
  const photoUrl = useWatch({ control, name: 'fotoPerfilUrl' });
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      senhaAtual: '',
      novaSenha: '',
      confirmarNovaSenha: '',
    },
  });

  useEffect(() => {
    if (!profileQuery.data) return;
    reset({
      nome: profileQuery.data.nome ?? '',
      telefone: profileQuery.data.telefone ?? '',
      endereco: profileQuery.data.endereco ?? '',
      fotoPerfilUrl: profileQuery.data.fotoPerfilUrl ?? '',
    });
  }, [profileQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: (payload: AtualizarPerfilPayload) => atualizarMeuPerfil(payload),
    onSuccess: async data => {
      queryClient.setQueryData(['meu-perfil'], data);
      await queryClient.invalidateQueries({ queryKey: ['meu-perfil'] });
      setFeedback({ type: 'success', message: 'Perfil atualizado com sucesso.' });
    },
    onError: error => setFeedback({
      type: 'error',
      message: getApiErrorMessage(error, 'Não foi possível atualizar seu perfil.'),
    }),
  });

  const passwordMutation = useMutation({
    mutationFn: (payload: AlterarSenhaPayload) => alterarMinhaSenha(payload),
    onSuccess: () => {
      resetPassword();
      setPasswordFeedback({
        type: 'success',
        message: 'Senha alterada com sucesso.',
      });
    },
    onError: error =>
      setPasswordFeedback({
        type: 'error',
        message: getPasswordErrorMessage(error),
      }),
  });

  if (profileQuery.isLoading) {
    return <Page><Heading /><LoadingState label="Carregando seu perfil..." /></Page>;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return <Page><Heading /><ErrorMessage message="Não foi possível carregar os dados do seu perfil." onRetry={() => profileQuery.refetch()} /></Page>;
  }

  const profile = profileQuery.data;
  return (
    <Page>
      <Heading />
      {feedback && <FeedbackBanner feedback={feedback} />}

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border-4 border-card bg-siga-blue-50 text-primary shadow-lg ring-1 ring-border dark:bg-primary/10">
              {photoUrl ? <img src={photoUrl} alt="Foto de perfil" className="h-full w-full object-cover" /> : <UserRound className="h-12 w-12" />}
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">{profile.nome}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />{profile.perfil}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados pessoais</CardTitle>
            <CardDescription>Atualize somente as informações permitidas pela sua conta.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(data => { setFeedback(null); updateMutation.mutate(data); })} className="space-y-5">
              {feedback?.type === 'error' && <InlineError message={feedback.message} />}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Nome" error={errors.nome?.message}><Input {...register('nome')} /></FormField>
                <FormField label="Telefone" error={errors.telefone?.message}><Input placeholder="Ex.: 82999999999" {...register('telefone')} /></FormField>
              </div>
              <FormField label="Endereço" error={errors.endereco?.message}><Input placeholder="Cidade, bairro ou endereço" {...register('endereco')} /></FormField>
              <FormField label="URL da foto" error={errors.fotoPerfilUrl?.message}>
                <div className="relative"><Camera className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="https://..." className="pl-10" {...register('fotoPerfilUrl')} /></div>
              </FormField>

              <div className="grid gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-3">
                <ReadOnlyField label="CPF" value={profile.cpf} />
                <ReadOnlyField label="Email" value={profile.email} />
                <ReadOnlyField label="Perfil" value={profile.perfil} />
              </div>

              <div className="flex justify-end border-t border-border pt-5">
                <Button type="submit" disabled={updateMutation.isPending}><Save className="h-4 w-4" />{updateMutation.isPending ? 'Salvando...' : 'Salvar alterações'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-start-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <KeyRound className="h-5 w-5" />
              </span>
              <div>
                <CardTitle>Alterar senha</CardTitle>
                <CardDescription>
                  Confirme sua senha atual antes de definir uma nova.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              onSubmit={handlePasswordSubmit(({ senhaAtual, novaSenha }) => {
                setPasswordFeedback(null);
                passwordMutation.mutate({ senhaAtual, novaSenha });
              })}
            >
              {passwordFeedback && (
                <FeedbackBanner feedback={passwordFeedback} />
              )}
              <FormField
                label="Senha atual"
                error={passwordErrors.senhaAtual?.message}
              >
                <Input
                  type="password"
                  autoComplete="current-password"
                  {...registerPassword('senhaAtual')}
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Nova senha"
                  error={passwordErrors.novaSenha?.message}
                >
                  <Input
                    type="password"
                    autoComplete="new-password"
                    {...registerPassword('novaSenha')}
                  />
                </FormField>
                <FormField
                  label="Confirmar nova senha"
                  error={passwordErrors.confirmarNovaSenha?.message}
                >
                  <Input
                    type="password"
                    autoComplete="new-password"
                    {...registerPassword('confirmarNovaSenha')}
                  />
                </FormField>
              </div>
              <div className="flex justify-end border-t border-border pt-5">
                <Button type="submit" disabled={passwordMutation.isPending}>
                  <KeyRound className="h-4 w-4" />
                  {passwordMutation.isPending
                    ? 'Alterando...'
                    : 'Alterar senha'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}

function Page({ children }: { children: ReactNode }) {
  return <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</section>;
}

function Heading() {
  return <div><p className="text-sm font-medium text-accent">Conta e preferências</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">Meu perfil</h1><p className="mt-2 text-sm text-muted-foreground">Consulte seus dados de acesso e mantenha suas informações pessoais atualizadas.</p></div>;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-medium text-foreground">{value || 'Não informado'}</p></div>;
}

export default Profile;
