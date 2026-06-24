import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, Search, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  DeleteConfirmation,
  FeedbackBanner,
  FormField,
  InlineError,
  RowActions,
  type Feedback,
} from '@/components/entities/CrudElements';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { getApiErrorMessage } from '@/services/http';
import {
  atualizarProfessor,
  criarProfessor,
  excluirProfessor,
  getProfessorName,
  getProfessorSpecialty,
  listarProfessores,
  type Professor,
} from '@/services/professorService';

const professorSchema = z
  .object({
    editing: z.boolean(),
    nome: z.string(),
    cpf: z.string(),
    email: z.string(),
    senha: z.string(),
    titulacao: z.string().trim().min(2, 'Informe a titulação.'),
  })
  .superRefine((data, context) => {
    if (data.editing) return;

    if (data.nome.trim().length < 2) {
      context.addIssue({
        code: 'custom',
        path: ['nome'],
        message: 'Informe o nome.',
      });
    }
    if (!/^\d{11}$/.test(data.cpf.trim())) {
      context.addIssue({
        code: 'custom',
        path: ['cpf'],
        message: 'O CPF deve conter exatamente 11 dígitos.',
      });
    }
    if (!z.string().email().safeParse(data.email.trim()).success) {
      context.addIssue({
        code: 'custom',
        path: ['email'],
        message: 'Informe um email válido.',
      });
    }
    if (data.senha.trim().length < 6) {
      context.addIssue({
        code: 'custom',
        path: ['senha'],
        message: 'A senha deve ter pelo menos 6 caracteres.',
      });
    }
  });

type ProfessorFormData = z.infer<typeof professorSchema>;

const emptyForm: ProfessorFormData = {
  editing: false,
  nome: '',
  cpf: '',
  email: '',
  senha: '',
  titulacao: '',
};

function getProfessorSaveError(error: unknown, editing: boolean) {
  if (!axios.isAxiosError(error)) {
    return 'Não foi possível salvar o professor.';
  }

  if (!error.response) {
    return 'Backend indisponível. Verifique sua conexão e tente novamente.';
  }

  switch (error.response.status) {
    case 400:
      return 'Dados inválidos. Verifique os campos preenchidos, incluindo o CPF obrigatório.';
    case 401:
      return 'Sua sessão expirou. Entre novamente para continuar.';
    case 403:
      return editing
        ? 'Seu usuário não tem permissão para editar professores. Faça login com uma conta ADMIN.'
        : 'Seu usuário não tem permissão para cadastrar professores. Faça login com uma conta ADMIN.';
    case 409:
      return 'Já existe um cadastro com este email ou CPF.';
    default:
      return getApiErrorMessage(error, 'Não foi possível salvar o professor.');
  }
}

function Professors() {
  const queryClient = useQueryClient();
  const canManage = canManageStructure();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Professor | null>(null);
  const [deleting, setDeleting] = useState<Professor | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const professoresQuery = useQuery({
    queryKey: ['professores'],
    queryFn: listarProfessores,
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfessorFormData>({
    resolver: zodResolver(professorSchema),
    defaultValues: emptyForm,
  });

  const refreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['professores'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: (data: ProfessorFormData) =>
      editing
        ? atualizarProfessor(editing.id, { titulacao: data.titulacao })
        : criarProfessor({
            nome: data.nome.trim(),
            cpf: data.cpf.trim(),
            email: data.email.trim(),
            senha: data.senha,
            titulacao: data.titulacao,
          }),
    onSuccess: async () => {
      const action = editing ? 'atualizado' : 'cadastrado';
      await refreshData();
      setFeedback({
        type: 'success',
        message: `Professor ${action} com sucesso.`,
      });
      closeForm();
    },
    onError: error =>
      setFeedback({
        type: 'error',
        message: getProfessorSaveError(error, Boolean(editing)),
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: excluirProfessor,
    onSuccess: async () => {
      await refreshData();
      setDeleting(null);
      setFeedback({
        type: 'success',
        message: 'Professor excluído com sucesso.',
      });
    },
    onError: error =>
      setFeedback({
        type: 'error',
        message: getApiErrorMessage(
          error,
          'Não foi possível excluir o professor.',
        ),
      }),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    if (!term) return professoresQuery.data ?? [];

    return (professoresQuery.data ?? []).filter(professor =>
      [
        getProfessorName(professor),
        professor.email,
        getProfessorSpecialty(professor),
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(term),
    );
  }, [professoresQuery.data, search]);

  function openCreate() {
    setEditing(null);
    setFeedback(null);
    reset(emptyForm);
    setFormOpen(true);
  }

  function openEdit(professor: Professor) {
    setEditing(professor);
    setFeedback(null);
    reset({
      editing: true,
      nome: professor.nome,
      cpf: professor.cpf ?? '',
      email: professor.email,
      senha: '',
      titulacao: getProfessorSpecialty(professor),
    });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    reset(emptyForm);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
    >
      <PageHeader canManage={canManage} onCreate={openCreate} />

      {feedback && !formOpen && !deleting && (
        <FeedbackBanner feedback={feedback} />
      )}

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Professores cadastrados</CardTitle>
            <CardDescription className="mt-2">
              Corpo docente atualizado e organizado para consulta.
            </CardDescription>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Buscar por nome, email ou especialidade"
              className="pl-9"
              aria-label="Buscar professores"
            />
          </div>
        </CardHeader>
        <CardContent>
          {professoresQuery.isLoading ? (
            <LoadingState label="Carregando professores..." />
          ) : professoresQuery.isError ? (
            <ErrorMessage
              message="Não foi possível consultar os professores."
              onRetry={() => professoresQuery.refetch()}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={UserRound}
              title={search ? 'Nenhum professor encontrado' : 'Nenhum professor cadastrado'}
              description={
                search
                  ? 'Tente buscar por outro termo.'
                  : 'Cadastre o primeiro professor para formar o corpo docente.'
              }
              action={
                canManage && !search ? (
                  <Button size="sm" onClick={openCreate}>
                    <Plus className="h-4 w-4" />
                    Cadastrar professor
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <ProfessorList
              professores={filtered}
              canManage={canManage}
              onEdit={openEdit}
              onDelete={item => {
                setFeedback(null);
                setDeleting(item);
              }}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        open={formOpen}
        title={editing ? 'Editar professor' : 'Cadastrar professor'}
        description="Preencha os dados acadêmicos do professor."
        onClose={closeForm}
      >
        <form
          onSubmit={handleSubmit(data => saveMutation.mutate(data))}
          className="space-y-4"
        >
          {feedback?.type === 'error' && (
            <InlineError message={feedback.message} />
          )}
          {!editing && (
            <>
              <FormField label="Nome" error={errors.nome?.message}>
                <Input placeholder="Nome completo" {...register('nome')} />
              </FormField>
              <FormField label="CPF" error={errors.cpf?.message}>
                <Input
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="Somente 11 dígitos"
                  {...register('cpf')}
                />
              </FormField>
              <FormField label="Email" error={errors.email?.message}>
                <Input type="email" placeholder="professor@ifal.edu.br" {...register('email')} />
              </FormField>
              <FormField label="Senha" error={errors.senha?.message}>
                <Input type="password" placeholder="Mínimo de 6 caracteres" {...register('senha')} />
              </FormField>
            </>
          )}
          <FormField label="Titulação" error={errors.titulacao?.message}>
            <Input placeholder="Ex.: Mestre" {...register('titulacao')} />
          </FormField>
          <ModalActions
            pending={saveMutation.isPending}
            editing={Boolean(editing)}
            onCancel={closeForm}
          />
        </form>
      </Modal>

      <DeleteConfirmation
        open={Boolean(deleting)}
        entityLabel="professor"
        itemLabel={deleting ? getProfessorName(deleting) : ''}
        pending={deleteMutation.isPending}
        error={feedback?.type === 'error' ? feedback.message : undefined}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </motion.section>
  );
}

function PageHeader({
  canManage,
  onCreate,
}: {
  canManage: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-accent">Gestão acadêmica</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
          Professores
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Consulte e mantenha os registros do corpo docente.
        </p>
      </div>
      {canManage && (
        <Button
          onClick={onCreate}
          className="self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Novo professor
        </Button>
      )}
    </div>
  );
}

function ProfessorList({
  professores,
  canManage,
  onEdit,
  onDelete,
}: {
  professores: Professor[];
  canManage: boolean;
  onEdit: (item: Professor) => void;
  onDelete: (item: Professor) => void;
}) {
  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Titulação</TableHead>
              {canManage && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {professores.map(professor => (
              <TableRow key={professor.id}>
                <TableCell className="font-medium text-foreground">
                  #{professor.id}
                </TableCell>
                <TableCell>{professor.nome}</TableCell>
                <TableCell>{professor.email || '—'}</TableCell>
                <TableCell>{getProfessorSpecialty(professor) || '—'}</TableCell>
                {canManage && (
                  <TableCell>
                    <RowActions
                      item={professor}
                      label={getProfessorName(professor)}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-3 md:hidden">
        {professores.map(professor => (
          <article
            key={professor.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <h3 className="font-medium text-foreground">
              {getProfessorName(professor)}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {professor.email || 'Email não informado'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {getProfessorSpecialty(professor) || 'Especialidade não informada'}
            </p>
            {canManage && (
              <div className="mt-4 border-t border-border pt-3">
                <RowActions
                  item={professor}
                  label={getProfessorName(professor)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

function ModalActions({
  pending,
  editing,
  onCancel,
}: {
  pending: boolean;
  editing: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
      <Button variant="ghost" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={pending}>
        {pending
          ? 'Salvando...'
          : editing
            ? 'Salvar alterações'
            : 'Cadastrar professor'}
      </Button>
    </div>
  );
}

export default Professors;
