import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import {
  getDisciplinaName,
  listarDisciplinas,
  type Disciplina,
} from '@/services/disciplinaService';
import { getApiErrorMessage } from '@/services/http';
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
  getTurmaRoom,
  getTurmaShift,
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
});

type TurmaFormData = z.infer<typeof turmaSchema>;

const emptyForm: TurmaFormData = {
  semestre: '1',
  ano: new Date().getFullYear(),
  professorId: 0,
  disciplinaId: 0,
};

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
        message: getApiErrorMessage(error, 'Não foi possível salvar a turma.'),
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: excluirTurma,
    onSuccess: async () => {
      await refreshData();
      setDeleting(null);
      setFeedback({ type: 'success', message: 'Turma excluída com sucesso.' });
    },
    onError: error =>
      setFeedback({
        type: 'error',
        message: getApiErrorMessage(error, 'Não foi possível excluir a turma.'),
      }),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    if (!term) return turmasQuery.data ?? [];

    return (turmasQuery.data ?? []).filter(turma => {
      const professor = resolveProfessor(turma, professores);
      const disciplina = resolveDisciplina(turma, disciplinas);

      return [
        getTurmaName(turma),
        getTurmaYear(turma),
        getTurmaShift(turma),
        getTurmaRoom(turma),
        professor ? getProfessorName(professor) : turma.professorId,
        disciplina ? getDisciplinaName(disciplina) : turma.disciplinaId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(term);
    });
  }, [disciplinas, professores, search, turmasQuery.data]);

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
      professorId: turma.professorId ?? turma.professor?.id ?? 0,
      disciplinaId: turma.disciplinaId ?? turma.disciplina?.id ?? 0,
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
              Relações acadêmicas carregadas diretamente da API.
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
            <ClassList
              turmas={filtered}
              professores={professores}
              disciplinas={disciplinas}
              canManage={false}
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
              <Input placeholder="Ex.: 1" {...register('semestre')} />
            </FormField>
            <FormField label="Ano" error={errors.ano?.message}>
              <Input type="number" {...register('ano')} />
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
              <TableHead>Turma</TableHead>
              <TableHead>Ano / turno</TableHead>
              <TableHead>Sala / vagas</TableHead>
              <TableHead>Professor</TableHead>
              <TableHead>Disciplina</TableHead>
              {canManage && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {turmas.map(turma => {
              const professor = resolveProfessor(turma, professores);
              const disciplina = resolveDisciplina(turma, disciplinas);

              return (
                <TableRow key={turma.id}>
                  <TableCell className="font-medium text-foreground">
                    {getTurmaName(turma)}
                  </TableCell>
                  <TableCell>
                    {[getTurmaYear(turma), getTurmaShift(turma)]
                      .filter(Boolean)
                      .join(' • ') || '—'}
                  </TableCell>
                  <TableCell>
                    {[getTurmaRoom(turma), turma.vagas ? `${turma.vagas} vagas` : '']
                      .filter(Boolean)
                      .join(' • ') || '—'}
                  </TableCell>
                  <TableCell>
                    {professor
                      ? getProfessorName(professor)
                      : turma.professorId
                        ? `Professor #${turma.professorId}`
                        : '—'}
                  </TableCell>
                  <TableCell>
                    {disciplina
                      ? getDisciplinaName(disciplina)
                      : turma.disciplinaId
                        ? `Disciplina #${turma.disciplinaId}`
                        : '—'}
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
          const professor = resolveProfessor(turma, professores);
          const disciplina = resolveDisciplina(turma, disciplinas);

          return (
            <article
              key={turma.id}
              className="rounded-2xl border border-border bg-muted/30 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-medium text-foreground">{getTurmaName(turma)}</h3>
                <span className="text-xs text-accent">
                  {getTurmaYear(turma) || 'Ano não informado'}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm">
                <Relation label="Professor" value={professor ? getProfessorName(professor) : turma.professorId ? `#${turma.professorId}` : '—'} />
                <Relation label="Disciplina" value={disciplina ? getDisciplinaName(disciplina) : turma.disciplinaId ? `#${turma.disciplinaId}` : '—'} />
                <Relation
                  label="Turno e sala"
                  value={[getTurmaShift(turma), getTurmaRoom(turma)]
                    .filter(Boolean)
                    .join(' • ') || '—'}
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

function resolveProfessor(turma: Turma, professores: Professor[]) {
  return (
    turma.professor ??
    professores.find(professor => professor.id === turma.professorId)
  );
}

function resolveDisciplina(turma: Turma, disciplinas: Disciplina[]) {
  return (
    turma.disciplina ??
    disciplinas.find(disciplina => disciplina.id === turma.disciplinaId)
  );
}

export default Classes;
