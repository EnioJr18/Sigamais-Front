import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calculator, Plus, Search } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { buildEnrollmentLabel, getMatriculaContext } from '@/lib/academic';
import { canManageAcademicRecords } from '@/lib/rbac';
import { listarAlunos } from '@/services/alunoService';
import { getApiErrorMessage } from '@/services/http';
import { listarMatriculas, type Matricula } from '@/services/matriculaService';
import {
  atualizarNota,
  criarNota,
  excluirNota,
  getNotaMatriculaId,
  getNotaValue,
  listarNotas,
  type Nota,
  type NotaPayload,
} from '@/services/notaService';
import { listarTurmas } from '@/services/turmaService';

const notaSchema = z.object({
  matriculaId: z.coerce.number<number>().int().positive('Selecione a matrícula.'),
  valor: z.coerce.number<number>().min(0, 'A nota não pode ser negativa.').max(10, 'A nota máxima é 10.'),
  tipo: z.string().trim().min(1, 'Informe o tipo da avaliação.'),
});

type NotaFormData = z.infer<typeof notaSchema>;

function Grades() {
  const queryClient = useQueryClient();
  const canManage = canManageAcademicRecords();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Nota | null>(null);
  const [deleting, setDeleting] = useState<Nota | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const notasQuery = useQuery({ queryKey: ['notas'], queryFn: listarNotas });
  const matriculasQuery = useQuery({ queryKey: ['matriculas'], queryFn: listarMatriculas });
  const alunosQuery = useQuery({ queryKey: ['alunos'], queryFn: listarAlunos });
  const turmasQuery = useQuery({ queryKey: ['turmas'], queryFn: listarTurmas });

  const matriculas = useMemo(() => matriculasQuery.data ?? [], [matriculasQuery.data]);
  const alunos = useMemo(() => alunosQuery.data ?? [], [alunosQuery.data]);
  const turmas = useMemo(() => turmasQuery.data ?? [], [turmasQuery.data]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NotaFormData>({
    resolver: zodResolver(notaSchema),
    defaultValues: { matriculaId: 0, valor: 0, tipo: 'AVALIACAO' },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['notas'] });

  const saveMutation = useMutation({
    mutationFn: (payload: NotaPayload) => editing ? atualizarNota(editing.id, payload) : criarNota(payload),
    onSuccess: async () => {
      const action = editing ? 'atualizada' : 'lançada';
      await refresh();
      setFeedback({ type: 'success', message: `Nota ${action} com sucesso.` });
      closeForm();
    },
    onError: error => {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        void queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      }
      setFeedback({ type: 'error', message: getGradeSaveError(error) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: excluirNota,
    onSuccess: async () => {
      await refresh();
      setDeleting(null);
      setFeedback({ type: 'success', message: 'Nota excluída com sucesso.' });
    },
    onError: error => setFeedback({ type: 'error', message: getApiErrorMessage(error, 'Não foi possível excluir a nota.') }),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    if (!term) return notasQuery.data ?? [];
    return (notasQuery.data ?? []).filter(nota => {
      const matricula = resolveMatricula(nota, matriculas);
      const context = getNotaContext(nota, matricula, alunos, turmas);
      return [nota.id, getNotaMatriculaId(nota), getNotaValue(nota), nota.tipo, context.alunoLabel, context.alunoMatricula, context.disciplinaNome, context.turmaLabel]
        .filter(value => value !== undefined)
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(term);
    });
  }, [alunos, matriculas, notasQuery.data, search, turmas]);

  function openCreate() {
    setEditing(null);
    setFeedback(null);
    reset({ matriculaId: matriculas[0]?.id ?? 0, valor: 0, tipo: 'AVALIACAO' });
    setFormOpen(true);
  }

  function openEdit(nota: Nota) {
    setEditing(nota);
    setFeedback(null);
    reset({ matriculaId: getNotaMatriculaId(nota) ?? 0, valor: getNotaValue(nota), tipo: nota.tipo ?? 'AVALIACAO' });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    reset({ matriculaId: 0, valor: 0, tipo: 'AVALIACAO' });
  }

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-medium text-accent">Diário acadêmico</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">Notas</h1><p className="mt-2 text-sm text-muted-foreground">Lance e acompanhe o desempenho por matrícula.</p></div>
        {canManage && <Button onClick={openCreate} disabled={matriculas.length === 0}><Plus className="h-4 w-4" />Lançar nota</Button>}
      </div>

      {feedback && !formOpen && !deleting && <FeedbackBanner feedback={feedback} />}

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div><CardTitle>Notas registradas</CardTitle><CardDescription className="mt-2">Resultados carregados diretamente da API.</CardDescription></div>
          <div className="relative w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar aluno, turma, matrícula ou nota" className="pl-9" /></div>
        </CardHeader>
        <CardContent>
          {notasQuery.isLoading ? <LoadingState label="Carregando notas..." /> : notasQuery.isError ? <ErrorMessage message="Não foi possível consultar as notas." onRetry={() => notasQuery.refetch()} /> : filtered.length === 0 ? <EmptyState icon={Calculator} title={search ? 'Nenhuma nota encontrada' : 'Nenhuma nota registrada'} description={search ? 'Tente buscar por outro termo.' : 'Lance a primeira nota para uma matrícula.'} action={canManage && !search && matriculas.length > 0 ? <Button size="sm" onClick={openCreate}>Lançar nota</Button> : undefined} /> : <GradeList notas={filtered} matriculas={matriculas} alunos={alunos} turmas={turmas} canManage={false} onEdit={openEdit} onDelete={item => { setFeedback(null); setDeleting(item); }} />}
        </CardContent>
      </Card>

      <Modal open={formOpen} title={editing ? 'Editar nota' : 'Lançar nota'} description="A nota será vinculada à matrícula selecionada." onClose={closeForm}>
        <form onSubmit={handleSubmit(data => saveMutation.mutate({ matriculaId: Number(data.matriculaId), valor: Number(data.valor), tipo: data.tipo }))} className="space-y-4">
          {feedback?.type === 'error' && <InlineError message={feedback.message} />}
          <FormField label="Matrícula" error={errors.matriculaId?.message}><Select {...register('matriculaId')}><option value="">Selecione</option>{matriculas.map(item => <option key={item.id} value={item.id}>{buildEnrollmentLabel(item, alunos, turmas)}</option>)}</Select></FormField>
          <FormField label="Nota" error={errors.valor?.message}><Input type="number" min="0" max="10" step="0.1" {...register('valor')} /></FormField>
          <FormField label="Tipo da avaliação" error={errors.tipo?.message}><Input placeholder="Ex.: PROVA, TRABALHO" {...register('tipo')} /></FormField>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><Button variant="ghost" onClick={closeForm}>Cancelar</Button><Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Lançar nota'}</Button></div>
        </form>
      </Modal>

      <DeleteConfirmation open={Boolean(deleting)} entityLabel="nota" itemLabel={deleting ? `#${deleting.id}` : ''} pending={deleteMutation.isPending} error={feedback?.type === 'error' ? feedback.message : undefined} onClose={() => setDeleting(null)} onConfirm={() => deleting && deleteMutation.mutate(deleting.id)} />
    </motion.section>
  );
}

function GradeList({ notas, matriculas, alunos, turmas, canManage, onEdit, onDelete }: { notas: Nota[]; matriculas: Matricula[]; alunos: Awaited<ReturnType<typeof listarAlunos>>; turmas: Awaited<ReturnType<typeof listarTurmas>>; canManage: boolean; onEdit: (item: Nota) => void; onDelete: (item: Nota) => void }) {
  return <><div className="hidden lg:block"><Table><TableHeader><TableRow><TableHead>Aluno</TableHead><TableHead>Matrícula acadêmica</TableHead><TableHead>Disciplina</TableHead><TableHead>Turma / semestre</TableHead><TableHead>Valor</TableHead><TableHead>Tipo</TableHead>{canManage && <TableHead className="text-right">Ações</TableHead>}</TableRow></TableHeader><TableBody>{notas.map(nota => { const matricula = resolveMatricula(nota, matriculas); const context = getNotaContext(nota, matricula, alunos, turmas); return <TableRow key={nota.id}><TableCell className="font-medium text-foreground">{context.alunoLabel}</TableCell><TableCell>{context.alunoMatricula}</TableCell><TableCell>{context.disciplinaNome}</TableCell><TableCell>{context.turmaLabel}</TableCell><TableCell><span className="font-semibold text-primary">{getNotaValue(nota).toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</span></TableCell><TableCell>{nota.tipo || 'Não informado'}</TableCell>{canManage && <TableCell><RowActions item={nota} label={`nota ${nota.id}`} onEdit={onEdit} onDelete={onDelete} /></TableCell>}</TableRow>; })}</TableBody></Table></div><div className="grid gap-3 lg:hidden">{notas.map(nota => { const matricula = resolveMatricula(nota, matriculas); const context = getNotaContext(nota, matricula, alunos, turmas); return <article key={nota.id} className="rounded-2xl border border-border bg-muted/30 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-medium text-foreground">{context.alunoLabel}</h3><p className="mt-1 text-xs text-muted-foreground">Matrícula {context.alunoMatricula}</p><p className="mt-2 text-sm text-muted-foreground">{context.disciplinaNome} • {context.turmaLabel}</p></div><div className="text-right"><span className="text-xl font-semibold text-primary">{getNotaValue(nota).toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</span><p className="mt-1 text-xs text-muted-foreground">{nota.tipo || 'Não informado'}</p></div></div>{canManage && <div className="mt-4 border-t border-border pt-3"><RowActions item={nota} label={`nota ${nota.id}`} onEdit={onEdit} onDelete={onDelete} /></div>}</article>; })}</div></>;
}

function getNotaContext(nota: Nota, matricula: Matricula | undefined, alunos: Awaited<ReturnType<typeof listarAlunos>>, turmas: Awaited<ReturnType<typeof listarTurmas>>) {
  const base = matricula ? getMatriculaContext(matricula, alunos, turmas) : null;
  return {
    alunoLabel: nota.alunoNome || base?.alunoLabel || 'Aluno não identificado',
    alunoMatricula: nota.alunoMatricula || base?.alunoMatricula || 'Não informada',
    disciplinaNome: nota.disciplinaNome || base?.disciplinaNome || 'Disciplina não informada',
    turmaLabel: nota.turmaLabel || nota.semestre || base?.turmaLabel || `Matrícula #${getNotaMatriculaId(nota) ?? '—'}`,
  };
}

function resolveMatricula(nota: Nota, matriculas: Matricula[]) {
  return nota.matricula ?? matriculas.find(item => item.id === getNotaMatriculaId(nota));
}

function getGradeSaveError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return 'Não foi possível salvar a nota.';
  }

  switch (error.response?.status) {
    case 400:
      return 'Dados inválidos. Verifique matrícula, valor e tipo.';
    case 403:
      return 'Seu usuário não tem permissão para realizar essa operação.';
    case 404:
      return 'Matrícula não encontrada. Atualize a lista e tente novamente.';
    case 500:
      return 'Erro interno ao salvar. Verifique se a matrícula selecionada ainda existe no banco.';
    default:
      return getApiErrorMessage(error, 'Não foi possível salvar a nota.');
  }
}

export default Grades;
