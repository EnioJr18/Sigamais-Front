import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { GraduationCap, Plus, Search, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  DeleteConfirmation,
  FeedbackBanner,
  FormField,
  InlineError,
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
import { getMatriculaContext } from '@/lib/academic';
import { canManageStructure } from '@/lib/rbac';
import {
  getAlunoName,
  getAlunoRegistration,
  listarAlunos,
  type Aluno,
} from '@/services/alunoService';
import { getApiErrorMessage } from '@/services/http';
import {
  criarMatricula,
  excluirMatricula,
  listarMatriculas,
  type Matricula,
  type MatriculaPayload,
} from '@/services/matriculaService';
import { listarTurmas, type Turma } from '@/services/turmaService';

const matriculaSchema = z.object({
  alunoId: z.coerce.number<number>().int().positive('Selecione o aluno.'),
  turmaId: z.coerce.number<number>().int().positive('Selecione a turma.'),
});

type MatriculaFormData = z.infer<typeof matriculaSchema>;

function Enrollments() {
  const queryClient = useQueryClient();
  const canManage = canManageStructure();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Matricula | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const matriculasQuery = useQuery({
    queryKey: ['matriculas'],
    queryFn: listarMatriculas,
  });
  const alunosQuery = useQuery({ queryKey: ['alunos'], queryFn: listarAlunos });
  const turmasQuery = useQuery({ queryKey: ['turmas'], queryFn: listarTurmas });

  const alunos = useMemo(() => alunosQuery.data ?? [], [alunosQuery.data]);
  const turmas = useMemo(() => turmasQuery.data ?? [], [turmasQuery.data]);
  const relationsAvailable = alunos.length > 0 && turmas.length > 0;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MatriculaFormData>({
    resolver: zodResolver(matriculaSchema),
    defaultValues: { alunoId: 0, turmaId: 0 },
  });

  const refreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['matriculas'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: (payload: MatriculaPayload) => criarMatricula(payload),
    onSuccess: async () => {
      await refreshData();
      setFeedback({ type: 'success', message: 'Matrícula criada com sucesso.' });
      closeForm();
    },
    onError: error =>
      setFeedback({ type: 'error', message: getEnrollmentError(error) }),
  });

  const deleteMutation = useMutation({
    mutationFn: excluirMatricula,
    onSuccess: async () => {
      await refreshData();
      setDeleting(null);
      setFeedback({ type: 'success', message: 'Matrícula excluída com sucesso.' });
    },
    onError: error =>
      setFeedback({
        type: 'error',
        message: getApiErrorMessage(error, 'Não foi possível excluir a matrícula.'),
      }),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    if (!term) return matriculasQuery.data ?? [];

    return (matriculasQuery.data ?? []).filter(matricula => {
      const context = getMatriculaContext(matricula, alunos, turmas);
      return [
        matricula.id,
        context.alunoLabel,
        context.alunoMatricula,
        context.turmaLabel,
        context.disciplinaNome,
        context.professorNome,
      ]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(term);
    });
  }, [alunos, matriculasQuery.data, search, turmas]);

  function openCreate() {
    setFeedback(null);
    reset({ alunoId: alunos[0]?.id ?? 0, turmaId: turmas[0]?.id ?? 0 });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    reset({ alunoId: 0, turmaId: 0 });
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Rotina acadêmica</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            Matrículas
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gerencie os vínculos entre estudantes e turmas.
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreate} disabled={!relationsAvailable}>
            <Plus className="h-4 w-4" />
            Nova matrícula
          </Button>
        )}
      </div>

      {feedback && !formOpen && !deleting && (
        <FeedbackBanner feedback={feedback} />
      )}
      {canManage && !relationsAvailable && !alunosQuery.isLoading && !turmasQuery.isLoading && (
        <div className="rounded-2xl border border-accent/25 bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          Cadastre ao menos um aluno e uma turma antes de criar matrículas.
        </div>
      )}

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Matrículas registradas</CardTitle>
            <CardDescription className="mt-2">
              Vínculos acadêmicos carregados diretamente da API.
            </CardDescription>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Buscar aluno, turma ou ID"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {matriculasQuery.isLoading ? (
            <LoadingState label="Carregando matrículas..." />
          ) : matriculasQuery.isError ? (
            <ErrorMessage
              message="Não foi possível consultar as matrículas."
              onRetry={() => matriculasQuery.refetch()}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title={search ? 'Nenhuma matrícula encontrada' : 'Nenhuma matrícula registrada'}
              description={search ? 'Tente buscar por outro termo.' : 'Crie o primeiro vínculo entre um aluno e uma turma.'}
              action={canManage && !search && relationsAvailable ? <Button size="sm" onClick={openCreate}>Cadastrar matrícula</Button> : undefined}
            />
          ) : (
            <EnrollmentList
              matriculas={filtered}
              alunos={alunos}
              turmas={turmas}
              canManage={false}
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
        title="Criar matrícula"
        description="Selecione o aluno e a turma para efetivar o vínculo."
        onClose={closeForm}
      >
        <form
          onSubmit={handleSubmit(data =>
            createMutation.mutate({
              alunoId: Number(data.alunoId),
              turmaId: Number(data.turmaId),
            }),
          )}
          className="space-y-4"
        >
          {feedback?.type === 'error' && <InlineError message={feedback.message} />}
          <FormField label="Aluno" error={errors.alunoId?.message}>
            <Select {...register('alunoId')}>
              <option value="">Selecione</option>
              {alunos.map(aluno => <option key={aluno.id} value={aluno.id}>{getAlunoOptionLabel(aluno)}</option>)}
            </Select>
          </FormField>
          <FormField label="Turma" error={errors.turmaId?.message}>
            <Select {...register('turmaId')}>
              <option value="">Selecione</option>
              {turmas.map(turma => <option key={turma.id} value={turma.id}>{getTurmaOptionLabel(turma)}</option>)}
            </Select>
          </FormField>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={closeForm}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Matriculando...' : 'Criar matrícula'}
            </Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmation
        open={Boolean(deleting)}
        entityLabel="matrícula"
        itemLabel={deleting ? `#${deleting.id}` : ''}
        pending={deleteMutation.isPending}
        error={feedback?.type === 'error' ? feedback.message : undefined}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </motion.section>
  );
}

function EnrollmentList({ matriculas, alunos, turmas, canManage, onDelete }: {
  matriculas: Matricula[];
  alunos: Awaited<ReturnType<typeof listarAlunos>>;
  turmas: Awaited<ReturnType<typeof listarTurmas>>;
  canManage: boolean;
  onDelete: (item: Matricula) => void;
}) {
  return (
    <>
      <div className="hidden lg:block">
        <Table>
          <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Aluno</TableHead><TableHead>Matrícula</TableHead><TableHead>Turma / semestre</TableHead><TableHead>Disciplina</TableHead><TableHead>Professor</TableHead>{canManage && <TableHead className="text-right">Ações</TableHead>}</TableRow></TableHeader>
          <TableBody>
            {matriculas.map(item => {
              const context = getMatriculaContext(item, alunos, turmas);
              return <TableRow key={item.id}><TableCell>#{item.id}</TableCell><TableCell className="font-medium text-foreground">{context.alunoLabel}</TableCell><TableCell>{context.alunoMatricula}</TableCell><TableCell>{context.turmaLabel}</TableCell><TableCell>{context.disciplinaNome}</TableCell><TableCell>{context.professorNome}</TableCell>{canManage && <TableCell><div className="flex justify-end"><Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => onDelete(item)} aria-label={`Excluir matrícula ${item.id}`}><Trash2 className="h-4 w-4" /></Button></div></TableCell>}</TableRow>;
            })}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-3 lg:hidden">
        {matriculas.map(item => {
          const context = getMatriculaContext(item, alunos, turmas);
          return <article key={item.id} className="rounded-2xl border border-border bg-muted/30 p-4"><div className="flex items-start justify-between"><div><h3 className="font-medium text-foreground">{context.alunoLabel}</h3><p className="mt-1 text-xs text-muted-foreground">Matrícula {context.alunoMatricula}</p></div><span className="text-xs text-accent">#{item.id}</span></div><dl className="mt-4 grid gap-2 text-sm"><Relation label="Turma / semestre" value={context.turmaLabel} /><Relation label="Disciplina" value={context.disciplinaNome} /><Relation label="Professor" value={context.professorNome} /></dl>{canManage && <div className="mt-4 border-t border-border pt-3"><Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(item)}><Trash2 className="h-4 w-4" />Excluir</Button></div>}</article>;
        })}
      </div>
    </>
  );
}

function Relation({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="text-foreground">{value}</dd></div>;
}

function getAlunoOptionLabel(aluno: Aluno) {
  const identificacao = getAlunoRegistration(aluno);
  return `${getAlunoName(aluno)} - ${identificacao ? `Matrícula ${identificacao}` : `#${aluno.id}`}`;
}

function getTurmaOptionLabel(turma: Turma) {
  const disciplina = turma.disciplinaNome || (turma.disciplinaId ? `Disciplina #${turma.disciplinaId}` : 'Disciplina não informada');
  const professor = turma.professorNome || (turma.professorId ? `Professor #${turma.professorId}` : 'Professor não informado');
  const vagas = turma.vagas === undefined ? 'Vagas não informadas' : `${turma.vagas} vagas`;
  return `${turma.semestre || `Turma #${turma.id}`} - ${disciplina} - Prof. ${professor.replace(/^Professor /, '')} - ${vagas}`;
}

function getEnrollmentError(error: unknown) {
  if (axios.isAxiosError(error) && [400, 409].includes(error.response?.status ?? 0)) {
    return getApiErrorMessage(error, 'Não foi possível matricular: a turma pode estar sem vagas ou o vínculo já existe.');
  }
  return getApiErrorMessage(error, 'Não foi possível criar a matrícula.');
}

export default Enrollments;
