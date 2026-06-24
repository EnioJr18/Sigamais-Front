import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { GraduationCap, Plus, Search } from 'lucide-react';
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
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { canManageStructure } from '@/lib/rbac';
import { usePagination } from '@/hooks/usePagination';
import {
  getDisciplinaName,
  listarDisciplinas,
  type Disciplina,
} from '@/services/disciplinaService';
import {
  getApiErrorMessage,
  getOperationErrorMessage,
} from '@/services/http';
import {
  getProfessorName,
  listarProfessores,
  type Professor,
} from '@/services/professorService';
import {
  atualizarTurma,
  criarTurma,
  excluirTurma,
  getTurmaName,
  getTurmaYear,
  listarTurmas,
  type Turma,
  type TurmaPayload,
} from '@/services/turmaService';

const turmaSchema = z.object({
  semestre: z.string().trim().min(1, 'Informe o semestre.'),
  ano: z.coerce
    .number<number>()
    .int('Use um ano inteiro.')
    .min(2000, 'Informe um ano válido.')
    .max(2100, 'Informe um ano válido.'),
  professorId: z.coerce.number<number>().int().positive('Selecione o professor.'),
  disciplinaId: z.coerce.number<number>().int().positive('Selecione a disciplina.'),
  vagas: z.coerce
    .number<number>({ error: 'Informe a quantidade de vagas.' })
    .int('Use uma quantidade inteira de vagas.')
    .positive('A quantidade de vagas deve ser maior que zero.'),
});

type TurmaFormData = z.infer<typeof turmaSchema>;

const emptyForm: TurmaFormData = {
  semestre: `${new Date().getFullYear()}.1`,
  ano: new Date().getFullYear(),
  professorId: 0,
  disciplinaId: 0,
  vagas: 40,
};

function getTurmaSaveError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return 'Não foi possível salvar a turma.';
  }
  if (!error.response) {
    return 'Não foi possível conectar ao sistema.';
  }

  switch (error.response.status) {
    case 400:
      return 'Dados inválidos para criar turma. Verifique professor, disciplina, semestre, ano e vagas.';
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    case 403:
      return 'Seu usuário não tem permissão para cadastrar turmas.';
    case 409:
      return 'Já existe uma turma com esses dados ou há conflito de regra de negócio.';
    default:
      return getApiErrorMessage(error, 'Não foi possível salvar a turma.');
  }
}

function Classes() {
  const queryClient = useQueryClient();
  const canManage = canManageStructure();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Turma | null>(null);
  const [deleting, setDeleting] = useState<Turma | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const turmasQuery = useQuery({ queryKey: ['turmas'], queryFn: listarTurmas });
  const professoresQuery = useQuery({
    queryKey: ['professores'],
    queryFn: listarProfessores,
  });
  const disciplinasQuery = useQuery({
    queryKey: ['disciplinas'],
    queryFn: listarDisciplinas,
  });

  const professores = useMemo(
    () => professoresQuery.data ?? [],
    [professoresQuery.data],
  );
  const disciplinas = useMemo(
    () => disciplinasQuery.data ?? [],
    [disciplinasQuery.data],
  );
  const relationError = professoresQuery.isError || disciplinasQuery.isError;
  const relationsAvailable = professores.length > 0 && disciplinas.length > 0;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TurmaFormData>({
    resolver: zodResolver(turmaSchema),
    defaultValues: emptyForm,
  });

  const refreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['turmas'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: (payload: TurmaPayload) =>
      editing ? atualizarTurma(editing.id, payload) : criarTurma(payload),
    onSuccess: async () => {
      const action = editing ? 'atualizada' : 'cadastrada';
      await refreshData();
      setFeedback({
        type: 'success',
        message: `Turma ${action} com sucesso.`,
      });
      closeForm();
    },
    onError: error =>
      setFeedback({
        type: 'error',
        message: editing
          ? getOperationErrorMessage(error, {
              badRequest:
                'Não foi possível atualizar esta turma. Verifique professor, disciplina, semestre, ano e vagas.',
            })
          : getTurmaSaveError(error),
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: excluirTurma,
    onSuccess: async () => {
      await refreshData();
      setDeleting(null);
      setFeedback({ type: 'success', message: 'Turma apagada com sucesso.' });
    },
    onError: error =>
      setFeedback({
        type: 'error',
        message: getOperationErrorMessage(error, {
          badRequest:
            'Não foi possível apagar esta turma. Ela pode possuir matrículas vinculadas.',
        }),
      }),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    if (!term) return turmasQuery.data ?? [];

    return (turmasQuery.data ?? []).filter(turma => {
      const professorNome = resolveProfessorName(turma, professores);
      const disciplinaNome = resolveDisciplinaName(turma, disciplinas);

      return [
        getTurmaName(turma),
        getTurmaYear(turma),
        professorNome,
        disciplinaNome,
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(term);
    });
  }, [disciplinas, professores, search, turmasQuery.data]);
  const pagination = usePagination(filtered, { resetKey: search });

  function openCreate() {
    setEditing(null);
    setFeedback(null);
    reset({
      ...emptyForm,
      professorId: professores[0]?.id ?? 0,
      disciplinaId: disciplinas[0]?.id ?? 0,
    });
    setFormOpen(true);
  }

  function openEdit(turma: Turma) {
    setEditing(turma);
    setFeedback(null);
    reset({
      semestre: turma.semestre ?? '',
      ano: Number(getTurmaYear(turma)) || new Date().getFullYear(),
      professorId: turma.professorId ?? 0,
      disciplinaId: turma.disciplinaId ?? 0,
      vagas: turma.vagas ?? 40,
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Estrutura acadêmica</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            Turmas
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Relacione professores, disciplinas, salas e vagas.
          </p>
        </div>
        {canManage && (
          <Button
            onClick={openCreate}
            disabled={!relationsAvailable}
            className="self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Nova turma
          </Button>
        )}
      </div>

      {feedback && !formOpen && !deleting && (
        <FeedbackBanner feedback={feedback} />
      )}
      {canManage && !relationsAvailable && !relationError && (
        <div className="rounded-2xl border border-accent/25 bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          Cadastre ao menos um professor e uma disciplina antes de criar turmas.
        </div>
      )}
      {relationError && (
        <div className="rounded-2xl border border-accent/25 bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          Não foi possível carregar todos os vínculos. Os IDs permanecem
          visíveis quando disponíveis.
        </div>
      )}

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Turmas cadastradas</CardTitle>
            <CardDescription className="mt-2">
              Relações acadêmicas atualizadas e organizadas para consulta.
            </CardDescription>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Buscar turma, professor ou disciplina"
              className="pl-9"
              aria-label="Buscar turmas"
            />
          </div>
        </CardHeader>
        <CardContent>
          {turmasQuery.isLoading ? (
            <LoadingState label="Carregando turmas..." />
          ) : turmasQuery.isError ? (
            <ErrorMessage
              message="Não foi possível consultar as turmas."
              onRetry={() => turmasQuery.refetch()}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title={search ? 'Nenhuma turma encontrada' : 'Nenhuma turma cadastrada'}
              description={
                search
                  ? 'Tente buscar por outro termo.'
                  : 'Cadastre professores e disciplinas para abrir a primeira turma.'
              }
              action={
                canManage && !search && relationsAvailable ? (
                  <Button size="sm" onClick={openCreate}>
                    <Plus className="h-4 w-4" />
                    Cadastrar turma
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <ClassList
                turmas={pagination.pageItems}
                professores={professores}
                disciplinas={disciplinas}
                canManage={canManage}
                onEdit={openEdit}
                onDelete={item => {
                  setFeedback(null);
                  setDeleting(item);
                }}
              />
              <Pagination
                page={pagination.page}
                pageSize={pagination.pageSize}
                totalItems={pagination.totalItems}
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
                itemLabel="turmas"
              />
            </>
          )}
        </CardContent>
      </Card>

      <Modal
        open={formOpen}
        title={editing ? 'Editar turma' : 'Cadastrar turma'}
        description="Selecione o professor e a disciplina responsáveis."
        onClose={closeForm}
      >
        <form
          onSubmit={handleSubmit(data => saveMutation.mutate(data))}
          className="space-y-4"
        >
          {feedback?.type === 'error' && (
            <InlineError message={feedback.message} />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Semestre" error={errors.semestre?.message}>
              <Input placeholder="Ex.: 2026.1" {...register('semestre')} />
            </FormField>
            <FormField label="Ano" error={errors.ano?.message}>
              <Input type="number" {...register('ano')} />
            </FormField>
            <FormField label="Vagas" error={errors.vagas?.message}>
              <Input type="number" min="1" {...register('vagas')} />
            </FormField>
            <FormField
              label="Professor responsável"
              error={errors.professorId?.message}
            >
              <Select {...register('professorId')}>
                <option value="">Selecione</option>
                {professores.map(professor => (
                  <option key={professor.id} value={professor.id}>
                    {getProfessorName(professor)}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          <FormField
            label="Disciplina"
            error={errors.disciplinaId?.message}
          >
            <Select {...register('disciplinaId')}>
              <option value="">Selecione</option>
              {disciplinas.map(disciplina => (
                <option key={disciplina.id} value={disciplina.id}>
                  {getDisciplinaName(disciplina)}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={closeForm}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending
                ? 'Salvando...'
                : editing
                  ? 'Salvar alterações'
                  : 'Cadastrar turma'}
            </Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmation
        open={Boolean(deleting)}
        entityLabel="turma"
        itemLabel={deleting ? getTurmaName(deleting) : ''}
        pending={deleteMutation.isPending}
        error={feedback?.type === 'error' ? feedback.message : undefined}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Apagar turma"
        confirmationMessage="Tem certeza que deseja apagar esta turma? Esta ação não poderá ser desfeita."
        confirmLabel="Apagar"
        pendingLabel="Apagando..."
      />
    </motion.section>
  );
}

function ClassList({
  turmas,
  professores,
  disciplinas,
  canManage,
  onEdit,
  onDelete,
}: {
  turmas: Turma[];
  professores: Professor[];
  disciplinas: Disciplina[];
  canManage: boolean;
  onEdit: (item: Turma) => void;
  onDelete: (item: Turma) => void;
}) {
  return (
    <>
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Semestre</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Vagas</TableHead>
              <TableHead>Professor</TableHead>
              <TableHead>Disciplina</TableHead>
              {canManage && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {turmas.map(turma => {
              const professorNome = resolveProfessorName(turma, professores);
              const disciplinaNome = resolveDisciplinaName(turma, disciplinas);

              return (
                <TableRow key={turma.id}>
                  <TableCell className="font-medium text-foreground">
                    {getTurmaName(turma)}
                  </TableCell>
                  <TableCell>
                    {getTurmaYear(turma) || '—'}
                  </TableCell>
                  <TableCell>
                    {turma.vagas ?? '—'}
                  </TableCell>
                  <TableCell>
                    {professorNome}
                  </TableCell>
                  <TableCell>
                    {disciplinaNome}
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      <RowActions
                        item={turma}
                        label={getTurmaName(turma)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {turmas.map(turma => {
          const professorNome = resolveProfessorName(turma, professores);
          const disciplinaNome = resolveDisciplinaName(turma, disciplinas);

          return (
            <article
              key={turma.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-medium text-foreground">{getTurmaName(turma)}</h3>
                <span className="text-xs text-accent">
                  {getTurmaYear(turma) || 'Ano não informado'}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm">
                <Relation label="Professor" value={professorNome} />
                <Relation label="Disciplina" value={disciplinaNome} />
                <Relation
                  label="Vagas"
                  value={turma.vagas === undefined ? 'Não informadas' : String(turma.vagas)}
                />
              </dl>
              {canManage && (
                <div className="mt-4 border-t border-border pt-3">
                  <RowActions
                    item={turma}
                    label={getTurmaName(turma)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}

function Relation({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}

function resolveProfessorName(turma: Turma, professores: Professor[]) {
  const professor = professores.find(item => item.id === turma.professorId);
  return (
    turma.professorNome ||
    (professor ? getProfessorName(professor) : '') ||
    (turma.professorId ? `Professor #${turma.professorId}` : 'Professor não informado')
  );
}

function resolveDisciplinaName(turma: Turma, disciplinas: Disciplina[]) {
  const disciplina = disciplinas.find(item => item.id === turma.disciplinaId);
  return (
    turma.disciplinaNome ||
    (disciplina ? getDisciplinaName(disciplina) : '') ||
    (turma.disciplinaId ? `Disciplina #${turma.disciplinaId}` : 'Disciplina não informada')
  );
}

export default Classes;
