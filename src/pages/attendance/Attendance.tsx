import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { getMatriculaContext } from '@/lib/academic';
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
    onError: error => setFeedback({ type: 'error', message: getApiErrorMessage(error, 'Não foi possível salvar a frequência.') }),
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
      const context = matricula ? getMatriculaContext(matricula, alunos, turmas) : null;
      return [frequencia.id, getFrequenciaMatriculaId(frequencia), context?.alunoLabel, context?.turmaLabel, getFaltas(frequencia)].filter(value => value !== undefined).join(' ').toLocaleLowerCase('pt-BR').includes(term);
    });
  }, [alunos, frequenciasQuery.data, matriculas, search, turmas]);

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
      <Card><CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"><div><CardTitle>Frequências registradas</CardTitle><CardDescription className="mt-2">Faltas carregadas diretamente da API.</CardDescription></div><div className="relative w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar aluno, turma ou matrícula" className="pl-9" /></div></CardHeader><CardContent>{frequenciasQuery.isLoading ? <LoadingState label="Carregando frequências..." /> : frequenciasQuery.isError ? <ErrorMessage message="Não foi possível consultar as frequências." onRetry={() => frequenciasQuery.refetch()} /> : filtered.length === 0 ? <EmptyState icon={ScrollText} title={search ? 'Nenhuma frequência encontrada' : 'Nenhuma frequência registrada'} description={search ? 'Tente buscar por outro termo.' : 'Registre as primeiras faltas.'} action={canManage && !search && matriculas.length > 0 ? <Button size="sm" onClick={openCreate}>Lançar frequência</Button> : undefined} /> : <AttendanceList frequencias={filtered} matriculas={matriculas} alunos={alunos} turmas={turmas} canManage={false} onEdit={openEdit} onDelete={item => { setFeedback(null); setDeleting(item); }} />}</CardContent></Card>

      <Modal open={formOpen} title={editing ? 'Editar frequência' : 'Lançar frequência'} description="As faltas serão vinculadas à matrícula selecionada." onClose={closeForm}><form onSubmit={handleSubmit(data => saveMutation.mutate(data))} className="space-y-4">{feedback?.type === 'error' && <InlineError message={feedback.message} />}<FormField label="Matrícula" error={errors.matriculaId?.message}><Select {...register('matriculaId')}><option value="">Selecione</option>{matriculas.map(item => { const context = getMatriculaContext(item, alunos, turmas); return <option key={item.id} value={item.id}>#{item.id} — {context.alunoLabel} / {context.turmaLabel}</option>; })}</Select></FormField><FormField label="Faltas" error={errors.faltas?.message}><Input type="number" min="0" {...register('faltas')} /></FormField><div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><Button variant="ghost" onClick={closeForm}>Cancelar</Button><Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Lançar frequência'}</Button></div></form></Modal>
      <DeleteConfirmation open={Boolean(deleting)} entityLabel="frequência" itemLabel={deleting ? `#${deleting.id}` : ''} pending={deleteMutation.isPending} error={feedback?.type === 'error' ? feedback.message : undefined} onClose={() => setDeleting(null)} onConfirm={() => deleting && deleteMutation.mutate(deleting.id)} />
    </motion.section>
  );
}

function AttendanceList({ frequencias, matriculas, alunos, turmas, canManage, onEdit, onDelete }: { frequencias: Frequencia[]; matriculas: Matricula[]; alunos: Awaited<ReturnType<typeof listarAlunos>>; turmas: Awaited<ReturnType<typeof listarTurmas>>; canManage: boolean; onEdit: (item: Frequencia) => void; onDelete: (item: Frequencia) => void }) {
  return <><div className="hidden md:block"><Table><TableHeader><TableRow><TableHead>Aluno</TableHead><TableHead>Turma</TableHead><TableHead>Matrícula</TableHead><TableHead>Faltas</TableHead>{canManage && <TableHead className="text-right">Ações</TableHead>}</TableRow></TableHeader><TableBody>{frequencias.map(item => { const matricula = resolveMatricula(item, matriculas); const context = matricula ? getMatriculaContext(matricula, alunos, turmas) : null; return <TableRow key={item.id}><TableCell className="font-medium text-foreground">{context?.alunoLabel ?? 'Aluno não identificado'}</TableCell><TableCell>{context?.turmaLabel ?? 'Turma não identificada'}</TableCell><TableCell>#{getFrequenciaMatriculaId(item) ?? '—'}</TableCell><TableCell className="text-destructive">{getFaltas(item)}</TableCell>{canManage && <TableCell><RowActions item={item} label={`frequência ${item.id}`} onEdit={onEdit} onDelete={onDelete} /></TableCell>}</TableRow>; })}</TableBody></Table></div><div className="grid gap-3 md:hidden">{frequencias.map(item => { const matricula = resolveMatricula(item, matriculas); const context = matricula ? getMatriculaContext(matricula, alunos, turmas) : null; return <article key={item.id} className="rounded-2xl border border-border bg-muted/30 p-4"><h3 className="font-medium text-foreground">{context?.alunoLabel ?? 'Aluno não identificado'}</h3><p className="mt-1 text-sm text-muted-foreground">{context?.turmaLabel ?? `Matrícula #${getFrequenciaMatriculaId(item) ?? '—'}`}</p><div className="mt-4 text-sm"><span className="text-destructive">{getFaltas(item)} faltas</span></div>{canManage && <div className="mt-4 border-t border-border pt-3"><RowActions item={item} label={`frequência ${item.id}`} onEdit={onEdit} onDelete={onDelete} /></div>}</article>; })}</div></>;
}

function resolveMatricula(item: Frequencia, matriculas: Matricula[]) {
  return item.matricula ?? matriculas.find(matricula => matricula.id === getFrequenciaMatriculaId(item));
}

export default Attendance;
