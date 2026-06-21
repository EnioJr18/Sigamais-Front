import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, ScrollText, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { DeleteConfirmation, FeedbackBanner, FormField, InlineError, RowActions, type Feedback } from '@/components/entities/CrudElements';
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
import {
  atualizarFrequencia,
  criarFrequencia,
  excluirFrequencia,
  getFaltas,
  getFrequenciaMatriculaId,
  listarFrequencias,
  type Frequencia,
  type FrequenciaPayload,
} from '@/services/frequenciaService';
import { getApiErrorMessage } from '@/services/http';
import { listarMatriculas, type Matricula } from '@/services/matriculaService';
import { listarTurmas } from '@/services/turmaService';

const frequenciaSchema = z.object({
  matriculaId: z.coerce.number<number>().int().positive('Selecione a matrícula.'),
  faltas: z.coerce.number<number>().int('Use um número inteiro.').min(0, 'O valor não pode ser negativo.'),
});

type FrequenciaFormData = z.infer<typeof frequenciaSchema>;

function Attendance() {
  const queryClient = useQueryClient();
  const canManage = canManageAcademicRecords();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Frequencia | null>(null);
  const [deleting, setDeleting] = useState<Frequencia | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const frequenciasQuery = useQuery({ queryKey: ['frequencias'], queryFn: listarFrequencias });
  const matriculasQuery = useQuery({ queryKey: ['matriculas'], queryFn: listarMatriculas });
  const alunosQuery = useQuery({ queryKey: ['alunos'], queryFn: listarAlunos });
  const turmasQuery = useQuery({ queryKey: ['turmas'], queryFn: listarTurmas });
  const matriculas = useMemo(() => matriculasQuery.data ?? [], [matriculasQuery.data]);
  const alunos = useMemo(() => alunosQuery.data ?? [], [alunosQuery.data]);
  const turmas = useMemo(() => turmasQuery.data ?? [], [turmasQuery.data]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FrequenciaFormData>({
    resolver: zodResolver(frequenciaSchema),
    defaultValues: { matriculaId: 0, faltas: 0 },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['frequencias'] });
  const saveMutation = useMutation({
    mutationFn: (payload: FrequenciaPayload) => editing ? atualizarFrequencia(editing.id, payload) : criarFrequencia(payload),
    onSuccess: async () => {
      const action = editing ? 'atualizada' : 'registrada';
      await refresh();
      setFeedback({ type: 'success', message: `Frequência ${action} com sucesso.` });
      closeForm();
    },
    onError: error => {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        void queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      }
      setFeedback({ type: 'error', message: getAttendanceSaveError(error) });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: excluirFrequencia,
    onSuccess: async () => {
      await refresh();
      setDeleting(null);
      setFeedback({ type: 'success', message: 'Frequência excluída com sucesso.' });
    },
    onError: error => setFeedback({ type: 'error', message: getApiErrorMessage(error, 'Não foi possível excluir a frequência.') }),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    if (!term) return frequenciasQuery.data ?? [];
    return (frequenciasQuery.data ?? []).filter(frequencia => {
      const matricula = resolveMatricula(frequencia, matriculas);
      const context = getFrequenciaContext(frequencia, matricula, alunos, turmas);
      return [frequencia.id, getFrequenciaMatriculaId(frequencia), context.alunoLabel, context.alunoMatricula, context.disciplinaNome, context.turmaLabel, getFaltas(frequencia)].filter(value => value !== undefined).join(' ').toLocaleLowerCase('pt-BR').includes(term);
    });
  }, [alunos, frequenciasQuery.data, matriculas, search, turmas]);
  const summaries = useMemo(
    () => buildAttendanceSummaries(filtered, matriculas, alunos, turmas),
    [alunos, filtered, matriculas, turmas],
  );

  function openCreate() {
    setEditing(null);
    setFeedback(null);
    reset({ matriculaId: matriculas[0]?.id ?? 0, faltas: 0 });
    setFormOpen(true);
  }
  function openEdit(item: Frequencia) {
    setEditing(item);
    setFeedback(null);
    reset({ matriculaId: getFrequenciaMatriculaId(item) ?? 0, faltas: getFaltas(item) });
    setFormOpen(true);
  }
  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    reset({ matriculaId: 0, faltas: 0 });
  }

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-accent">Diário acadêmico</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">Frequência</h1><p className="mt-2 text-sm text-muted-foreground">Registre presenças e faltas por matrícula.</p></div>{canManage && <Button onClick={openCreate} disabled={matriculas.length === 0}><Plus className="h-4 w-4" />Lançar frequência</Button>}</div>
      {feedback && !formOpen && !deleting && <FeedbackBanner feedback={feedback} />}
      <Card><CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"><div><CardTitle>Resumo de frequência</CardTitle><CardDescription className="mt-2">Faltas consolidadas por matrícula e disciplina.</CardDescription></div><div className="relative w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar aluno, turma ou matrícula" className="pl-9" /></div></CardHeader><CardContent>{frequenciasQuery.isLoading ? <LoadingState label="Carregando frequências..." /> : frequenciasQuery.isError ? <ErrorMessage message="Não foi possível consultar as frequências." onRetry={() => frequenciasQuery.refetch()} /> : filtered.length === 0 ? <EmptyState icon={ScrollText} title={search ? 'Nenhuma frequência encontrada' : 'Nenhuma frequência registrada'} description={search ? 'Tente buscar por outro termo.' : 'Registre as primeiras faltas.'} action={canManage && !search && matriculas.length > 0 ? <Button size="sm" onClick={openCreate}>Lançar frequência</Button> : undefined} /> : <AttendanceSummaryList summaries={summaries} />}</CardContent></Card>

      {filtered.length > 0 && (
        <Card><CardHeader><CardTitle>Lançamentos individuais</CardTitle><CardDescription>Histórico detalhado dos {filtered.length} registros encontrados.</CardDescription></CardHeader><CardContent><AttendanceList frequencias={filtered} matriculas={matriculas} alunos={alunos} turmas={turmas} canManage={false} onEdit={openEdit} onDelete={item => { setFeedback(null); setDeleting(item); }} /></CardContent></Card>
      )}

      <Modal open={formOpen} title={editing ? 'Editar frequência' : 'Lançar frequência'} description="As faltas serão vinculadas à matrícula selecionada." onClose={closeForm}><form onSubmit={handleSubmit(data => saveMutation.mutate({ matriculaId: Number(data.matriculaId), faltas: Number(data.faltas) }))} className="space-y-4">{feedback?.type === 'error' && <InlineError message={feedback.message} />}<FormField label="Matrícula" error={errors.matriculaId?.message}><Select {...register('matriculaId')}><option value="">Selecione</option>{matriculas.map(item => <option key={item.id} value={item.id}>{buildEnrollmentLabel(item, alunos, turmas)}</option>)}</Select></FormField><FormField label="Faltas" error={errors.faltas?.message}><Input type="number" min="0" {...register('faltas')} /></FormField><div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><Button variant="ghost" onClick={closeForm}>Cancelar</Button><Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Lançar frequência'}</Button></div></form></Modal>
      <DeleteConfirmation open={Boolean(deleting)} entityLabel="frequência" itemLabel={deleting ? `#${deleting.id}` : ''} pending={deleteMutation.isPending} error={feedback?.type === 'error' ? feedback.message : undefined} onClose={() => setDeleting(null)} onConfirm={() => deleting && deleteMutation.mutate(deleting.id)} />
    </motion.section>
  );
}

type AttendanceSummary = {
  key: string;
  alunoLabel: string;
  alunoMatricula: string;
  disciplinaNome: string;
  turmaLabel: string;
  totalFaltas: number;
  quantidade: number;
};

function buildAttendanceSummaries(
  frequencias: Frequencia[],
  matriculas: Matricula[],
  alunos: Awaited<ReturnType<typeof listarAlunos>>,
  turmas: Awaited<ReturnType<typeof listarTurmas>>,
) {
  const groups = new Map<string, AttendanceSummary>();

  frequencias.forEach(item => {
    const matricula = resolveMatricula(item, matriculas);
    const context = getFrequenciaContext(item, matricula, alunos, turmas);
    const key = [
      getFrequenciaMatriculaId(item) ?? 'sem-matricula',
      context.alunoLabel,
      context.disciplinaNome,
      context.turmaLabel,
    ].join('|');
    const current = groups.get(key);

    if (current) {
      current.totalFaltas += getFaltas(item);
      current.quantidade += 1;
      return;
    }

    groups.set(key, {
      key,
      ...context,
      totalFaltas: getFaltas(item),
      quantidade: 1,
    });
  });

  return Array.from(groups.values());
}

function AttendanceSummaryList({ summaries }: { summaries: AttendanceSummary[] }) {
  return <><div className="hidden lg:block"><Table><TableHeader><TableRow><TableHead>Aluno</TableHead><TableHead>Matrícula acadêmica</TableHead><TableHead>Disciplina</TableHead><TableHead>Turma / semestre</TableHead><TableHead>Total de faltas</TableHead><TableHead>Registros</TableHead></TableRow></TableHeader><TableBody>{summaries.map(summary => <TableRow key={summary.key}><TableCell className="font-semibold text-foreground">{summary.alunoLabel}</TableCell><TableCell>{summary.alunoMatricula}</TableCell><TableCell>{summary.disciplinaNome}</TableCell><TableCell>{summary.turmaLabel}</TableCell><TableCell><span className="text-lg font-bold text-destructive">{summary.totalFaltas}</span></TableCell><TableCell>{summary.quantidade} {summary.quantidade === 1 ? 'lançamento' : 'lançamentos'}</TableCell></TableRow>)}</TableBody></Table></div><div className="grid gap-3 lg:hidden">{summaries.map(summary => <article key={summary.key} className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold text-foreground">{summary.alunoLabel}</h3><p className="mt-1 text-xs text-muted-foreground">Matrícula {summary.alunoMatricula}</p></div><div className="text-right"><p className="text-2xl font-bold text-destructive">{summary.totalFaltas}</p><p className="text-xs text-muted-foreground">faltas</p></div></div><p className="mt-3 text-sm text-foreground">{summary.disciplinaNome}</p><p className="mt-1 text-xs text-muted-foreground">{summary.turmaLabel}</p><p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">{summary.quantidade} {summary.quantidade === 1 ? 'lançamento registrado' : 'lançamentos registrados'}</p></article>)}</div></>;
}

function AttendanceList({ frequencias, matriculas, alunos, turmas, canManage, onEdit, onDelete }: { frequencias: Frequencia[]; matriculas: Matricula[]; alunos: Awaited<ReturnType<typeof listarAlunos>>; turmas: Awaited<ReturnType<typeof listarTurmas>>; canManage: boolean; onEdit: (item: Frequencia) => void; onDelete: (item: Frequencia) => void }) {
  return <><div className="hidden lg:block"><Table><TableHeader><TableRow><TableHead>Aluno</TableHead><TableHead>Matrícula acadêmica</TableHead><TableHead>Disciplina</TableHead><TableHead>Turma / semestre</TableHead><TableHead>Faltas</TableHead>{canManage && <TableHead className="text-right">Ações</TableHead>}</TableRow></TableHeader><TableBody>{frequencias.map(item => { const matricula = resolveMatricula(item, matriculas); const context = getFrequenciaContext(item, matricula, alunos, turmas); return <TableRow key={item.id}><TableCell className="font-medium text-foreground">{context.alunoLabel}</TableCell><TableCell>{context.alunoMatricula}</TableCell><TableCell>{context.disciplinaNome}</TableCell><TableCell>{context.turmaLabel}</TableCell><TableCell className="font-semibold text-destructive">{getFaltas(item)}</TableCell>{canManage && <TableCell><RowActions item={item} label={`frequência ${item.id}`} onEdit={onEdit} onDelete={onDelete} /></TableCell>}</TableRow>; })}</TableBody></Table></div><div className="grid gap-3 lg:hidden">{frequencias.map(item => { const matricula = resolveMatricula(item, matriculas); const context = getFrequenciaContext(item, matricula, alunos, turmas); return <article key={item.id} className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-medium text-foreground">{context.alunoLabel}</h3><p className="mt-1 text-xs text-muted-foreground">Matrícula {context.alunoMatricula}</p><p className="mt-2 text-sm text-muted-foreground">{context.disciplinaNome} • {context.turmaLabel}</p></div><span className="font-semibold text-destructive">{getFaltas(item)} faltas</span></div>{canManage && <div className="mt-4 border-t border-border pt-3"><RowActions item={item} label={`frequência ${item.id}`} onEdit={onEdit} onDelete={onDelete} /></div>}</article>; })}</div></>;
}

function getFrequenciaContext(item: Frequencia, matricula: Matricula | undefined, alunos: Awaited<ReturnType<typeof listarAlunos>>, turmas: Awaited<ReturnType<typeof listarTurmas>>) {
  const base = matricula ? getMatriculaContext(matricula, alunos, turmas) : null;
  return {
    alunoLabel: item.alunoNome || base?.alunoLabel || 'Aluno não identificado',
    alunoMatricula: item.alunoMatricula || base?.alunoMatricula || 'Não informada',
    disciplinaNome: item.disciplinaNome || base?.disciplinaNome || 'Disciplina não informada',
    turmaLabel: item.turmaLabel || item.semestre || base?.turmaLabel || `Matrícula #${getFrequenciaMatriculaId(item) ?? '—'}`,
  };
}

function resolveMatricula(item: Frequencia, matriculas: Matricula[]) {
  return item.matricula ?? matriculas.find(matricula => matricula.id === getFrequenciaMatriculaId(item));
}

function getAttendanceSaveError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return 'Não foi possível salvar a frequência.';
  }

  switch (error.response?.status) {
    case 400:
      return 'Dados inválidos. Verifique matrícula e faltas.';
    case 403:
      return 'Seu usuário não tem permissão para realizar essa operação.';
    case 404:
      return 'Matrícula não encontrada. Atualize a lista e tente novamente.';
    case 500:
      return 'Erro interno ao salvar. Verifique se a matrícula selecionada ainda existe no banco.';
    default:
      return getApiErrorMessage(error, 'Não foi possível salvar a frequência.');
  }
}

export default Attendance;
