import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { canManageStructure } from '@/lib/rbac';
import {
  atualizarAluno,
  criarAluno,
  excluirAluno,
  listarAlunos,
  type Aluno,
  type AlunoPayload,
} from '@/services/alunoService';
import { getApiErrorMessage } from '@/services/http';

const alunoSchema = z.object({
  nome: z.string().trim().min(3, 'Informe pelo menos 3 caracteres.'),
  cpf: z.string().trim().min(11, 'Informe um CPF válido.'),
  email: z.string().trim().email('Informe um email válido.'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  matricula: z.string().trim().min(1, 'A matrícula é obrigatória.'),
  curso: z.string().trim().min(2, 'Informe o curso.'),
  rendaFamiliar: z.coerce.number<number>().min(0, 'Informe uma renda válida.'),
  anoIngresso: z.coerce.number<number>().int().min(2000).max(2100),
});

type AlunoFormData = z.infer<typeof alunoSchema>;

const emptyForm: AlunoFormData = {
  nome: '',
  cpf: '',
  email: '',
  senha: '',
  matricula: '',
  curso: '',
  rendaFamiliar: 0,
  anoIngresso: new Date().getFullYear(),
};

function Students() {
  const queryClient = useQueryClient();
  const canManage = canManageStructure();
  const canModify = false; // PUT/DELETE de alunos ainda não existem no backend.
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [deletingAluno, setDeletingAluno] = useState<Aluno | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const alunosQuery = useQuery({
    queryKey: ['alunos'],
    queryFn: listarAlunos,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AlunoFormData>({
    resolver: zodResolver(alunoSchema),
    defaultValues: emptyForm,
  });

  const refreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['alunos'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: (payload: AlunoPayload) =>
      editingAluno
        ? atualizarAluno(editingAluno.id, payload)
        : criarAluno(payload),
    onSuccess: async () => {
      const action = editingAluno ? 'atualizado' : 'cadastrado';
      await refreshData();
      setFeedback({
        type: 'success',
        message: `Aluno ${action} com sucesso.`,
      });
      closeForm();
    },
    onError: error => {
      setFeedback({
        type: 'error',
        message: getApiErrorMessage(error, 'Não foi possível salvar o aluno.'),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: excluirAluno,
    onSuccess: async () => {
      await refreshData();
      setDeletingAluno(null);
      setFeedback({
        type: 'success',
        message: 'Aluno excluído com sucesso.',
      });
    },
    onError: error => {
      setFeedback({
        type: 'error',
        message: getApiErrorMessage(error, 'Não foi possível excluir o aluno.'),
      });
    },
  });

  const filteredAlunos = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    if (!term) return alunosQuery.data ?? [];

    return (alunosQuery.data ?? []).filter(aluno =>
      [getAlunoName(aluno), aluno.email, getAlunoRegistration(aluno)]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(term),
    );
  }, [alunosQuery.data, search]);

  function openCreateForm() {
    setEditingAluno(null);
    setFeedback(null);
    reset(emptyForm);
    setFormOpen(true);
  }

  function openEditForm(aluno: Aluno) {
    setEditingAluno(aluno);
    setFeedback(null);
    reset({
      nome: getAlunoName(aluno),
      cpf: '',
      email: aluno.email ?? '',
      senha: '',
      matricula: getAlunoRegistration(aluno),
      curso: aluno.curso ?? '',
      rendaFamiliar: 0,
      anoIngresso: new Date().getFullYear(),
    });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingAluno(null);
    reset(emptyForm);
  }

  const onSubmit = (data: AlunoFormData) => {
    setFeedback(null);
    saveMutation.mutate(data);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Gestão acadêmica</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            Alunos
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Consulte e mantenha os registros de estudantes da instituição.
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreateForm} className="self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            Novo aluno
          </Button>
        )}
      </div>

      {feedback && !formOpen && !deletingAluno && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-success/25 bg-success/10 text-success dark:text-success-foreground'
              : 'border-destructive/25 bg-destructive/10 text-destructive dark:text-red-100'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Estudantes cadastrados</CardTitle>
            <CardDescription className="mt-2">
              Informações acadêmicas atualizadas e organizadas em um só lugar.
            </CardDescription>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Buscar por nome, email ou matrícula"
              className="pl-9"
              aria-label="Buscar alunos"
            />
          </div>
        </CardHeader>
        <CardContent>
          {alunosQuery.isLoading ? (
            <LoadingState label="Carregando alunos..." />
          ) : alunosQuery.isError ? (
            <ErrorMessage
              message="Não foi possível consultar os alunos. Tente novamente em instantes."
              onRetry={() => alunosQuery.refetch()}
            />
          ) : filteredAlunos.length === 0 ? (
            <EmptyState
              icon={Users}
              title={search ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
              description={
                search
                  ? 'Tente buscar por outro nome, email ou matrícula.'
                  : 'Cadastre o primeiro aluno para iniciar a gestão acadêmica.'
              }
              action={
                canManage && !search ? (
                  <Button size="sm" onClick={openCreateForm}>
                    <Plus className="h-4 w-4" />
                    Cadastrar aluno
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Status</TableHead>
                      {canModify && (
                        <TableHead className="text-right">Ações</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlunos.map(aluno => (
                      <TableRow key={aluno.id}>
                        <TableCell className="font-medium text-foreground">
                          {getAlunoName(aluno)}
                        </TableCell>
                        <TableCell>{aluno.email || '—'}</TableCell>
                        <TableCell>{getAlunoRegistration(aluno) || '—'}</TableCell>
                        <TableCell>
                          <Badge className="bg-success/10 text-success ring-success/20">
                            {aluno.status ?? 'Ativo'}
                          </Badge>
                        </TableCell>
                        {canModify && (
                          <TableCell>
                            <RowActions
                              aluno={aluno}
                              onEdit={openEditForm}
                              onDelete={setDeletingAluno}
                            />
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-3 md:hidden">
                {filteredAlunos.map(aluno => (
                  <article
                    key={aluno.id}
                    className="rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-medium text-foreground">
                          {getAlunoName(aluno)}
                        </h3>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {aluno.email || 'Email não informado'}
                        </p>
                      </div>
                      <Badge className="shrink-0 bg-success/10 text-success ring-success/20">
                        {aluno.status ?? 'Ativo'}
                      </Badge>
                    </div>
                    <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
                      Matrícula
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {getAlunoRegistration(aluno) || 'Não informada'}
                    </p>
                    {canModify && (
                      <div className="mt-4 border-t border-border pt-3">
                        <RowActions
                          aluno={aluno}
                          onEdit={openEditForm}
                          onDelete={setDeletingAluno}
                        />
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Modal
        open={formOpen}
        title={editingAluno ? 'Editar aluno' : 'Cadastrar aluno'}
        description="Preencha os dados acadêmicos do aluno."
        onClose={closeForm}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {feedback?.type === 'error' && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:text-red-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {feedback.message}
            </div>
          )}
          <FormField label="Nome" error={errors.nome?.message}>
            <Input placeholder="Nome completo" {...register('nome')} />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <Input
              type="email"
              placeholder="aluno@ifal.edu.br"
              {...register('email')}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="CPF" error={errors.cpf?.message}>
              <Input placeholder="00000000000" {...register('cpf')} />
            </FormField>
            <FormField label="Senha inicial" error={errors.senha?.message}>
              <Input type="password" {...register('senha')} />
            </FormField>
          </div>
          <FormField label="Matrícula" error={errors.matricula?.message}>
            <Input placeholder="20260001" {...register('matricula')} />
          </FormField>
          <FormField label="Curso" error={errors.curso?.message}>
            <Input placeholder="Sistemas de Informação" {...register('curso')} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Renda familiar" error={errors.rendaFamiliar?.message}>
              <Input type="number" min="0" step="0.01" {...register('rendaFamiliar')} />
            </FormField>
            <FormField label="Ano de ingresso" error={errors.anoIngresso?.message}>
              <Input type="number" {...register('anoIngresso')} />
            </FormField>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={closeForm}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending
                ? 'Salvando...'
                : editingAluno
                  ? 'Salvar alterações'
                  : 'Cadastrar aluno'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deletingAluno)}
        title="Excluir aluno"
        description="Esta ação não poderá ser desfeita."
        onClose={() => setDeletingAluno(null)}
      >
        {feedback?.type === 'error' && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:text-red-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {feedback.message}
          </div>
        )}
        <p className="text-sm leading-6 text-muted-foreground">
          Confirma a exclusão de{' '}
          <strong className="text-foreground">
            {deletingAluno ? getAlunoName(deletingAluno) : ''}
          </strong>
          ?
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setDeletingAluno(null)}>
            Cancelar
          </Button>
          <Button
            onClick={() =>
              deletingAluno && deleteMutation.mutate(deletingAluno.id)
            }
            disabled={deleteMutation.isPending}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4" />
            {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </Modal>
    </motion.section>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function RowActions({
  aluno,
  onEdit,
  onDelete,
}: {
  aluno: Aluno;
  onEdit: (aluno: Aluno) => void;
  onDelete: (aluno: Aluno) => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(aluno)}
        aria-label={`Editar ${getAlunoName(aluno)}`}
        className="text-primary hover:bg-primary/10 hover:text-primary"
      >
        <Edit3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(aluno)}
        aria-label={`Excluir ${getAlunoName(aluno)}`}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function getAlunoName(aluno: Aluno) {
  return aluno.nome || aluno.name || 'Aluno sem nome';
}

function getAlunoRegistration(aluno: Aluno) {
  return aluno.matricula || aluno.registration || '';
}

export default Students;
