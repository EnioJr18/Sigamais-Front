import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Activity,
  ArrowRight,
  BellRing,
  CircleCheck,
  Clock3,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import {
  FeedbackBanner,
  FormField,
  InlineError,
  type Feedback,
} from '@/components/entities/CrudElements';
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
import { Textarea } from '@/components/ui/textarea';
import {
  atualizarAlertaRisco,
  listarAlertasRisco,
  type AlertaRisco,
  type NivelRiscoAlerta,
  type StatusAlerta,
} from '@/services/alertaRiscoService';

const interventionSchema = z.object({
  status: z.enum(['PENDENTE', 'EM_ACOMPANHAMENTO', 'RESOLVIDO']),
  observacao: z
    .string()
    .trim()
    .max(1500, 'Use no máximo 1500 caracteres.'),
});

type InterventionForm = z.infer<typeof interventionSchema>;
type StatusFilter = 'TODOS' | StatusAlerta;

const statusConfig: Record<StatusAlerta, { label: string; className: string }> = {
  PENDENTE: {
    label: 'Pendente',
    className:
      'bg-orange-500/10 text-orange-700 ring-orange-500/20 dark:text-orange-300',
  },
  EM_ACOMPANHAMENTO: {
    label: 'Em acompanhamento',
    className:
      'bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300',
  },
  RESOLVIDO: {
    label: 'Resolvido',
    className:
      'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  },
};

const riskConfig: Record<NivelRiscoAlerta, string> = {
  ALTO: 'bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-300',
  MEDIO:
    'bg-orange-500/10 text-orange-700 ring-orange-500/20 dark:text-orange-300',
  BAIXO:
    'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
};

function RiskInterventions() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS');
  const [selected, setSelected] = useState<AlertaRisco | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const alertsQuery = useQuery({
    queryKey: ['alertas-risco'],
    queryFn: listarAlertasRisco,
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InterventionForm>({
    resolver: zodResolver(interventionSchema),
    defaultValues: { status: 'PENDENTE', observacao: '' },
  });

  const alerts = useMemo(() => alertsQuery.data ?? [], [alertsQuery.data]);
  const summary = useMemo(
    () => ({
      total: alerts.length,
      pending: alerts.filter(item => item.status === 'PENDENTE').length,
      tracking: alerts.filter(item => item.status === 'EM_ACOMPANHAMENTO').length,
      resolved: alerts.filter(item => item.status === 'RESOLVIDO').length,
    }),
    [alerts],
  );
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return alerts.filter(item => {
      const matchesStatus =
        statusFilter === 'TODOS' || item.status === statusFilter;
      const matchesSearch =
        !term ||
        [
          item.alunoNome,
          item.alunoMatricula,
          item.disciplinaNome,
          item.professorNome,
        ]
          .join(' ')
          .toLocaleLowerCase('pt-BR')
          .includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [alerts, search, statusFilter]);

  const updateMutation = useMutation({
    mutationFn: (data: InterventionForm) =>
      atualizarAlertaRisco(selected!.id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['alertas-risco'] });
      setSelected(null);
      reset();
      setFeedback({
        type: 'success',
        message: 'Acompanhamento atualizado com sucesso.',
      });
    },
    onError: error =>
      setFeedback({ type: 'error', message: getUpdateError(error) }),
  });

  function openIntervention(alert: AlertaRisco) {
    setFeedback(null);
    setSelected(alert);
    reset({ status: alert.status, observacao: alert.observacao });
  }

  function closeIntervention() {
    if (updateMutation.isPending) return;
    setSelected(null);
    reset();
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header>
        <div className="flex items-center gap-2 text-accent">
          <ShieldAlert className="h-4 w-4" />
          <p className="text-sm font-medium">Intervenção pedagógica</p>
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
          Alertas da Coordenação
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Acompanhe alunos em risco e registre ações de intervenção pedagógica.
        </p>
      </header>

      {feedback && !selected && <FeedbackBanner feedback={feedback} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={BellRing} label="Total de alertas" value={summary.total} />
        <SummaryCard icon={Clock3} label="Pendentes" value={summary.pending} tone="orange" />
        <SummaryCard icon={Activity} label="Em acompanhamento" value={summary.tracking} tone="blue" />
        <SummaryCard icon={CircleCheck} label="Resolvidos" value={summary.resolved} tone="green" />
      </div>

      <Card>
        <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between lg:space-y-0">
          <div>
            <CardTitle>Casos notificados</CardTitle>
            <CardDescription className="mt-2">
              Consulte o histórico e mantenha o acompanhamento atualizado.
            </CardDescription>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_13rem] lg:max-w-2xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Buscar aluno, matrícula, disciplina ou professor"
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={event =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              aria-label="Filtrar alertas por status"
            >
              <option value="TODOS">Todos os status</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="EM_ACOMPANHAMENTO">Em acompanhamento</option>
              <option value="RESOLVIDO">Resolvidos</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {alertsQuery.isLoading ? (
            <LoadingState label="Carregando alertas da coordenação..." />
          ) : alertsQuery.isError ? (
            <ErrorMessage
              message="Não foi possível carregar os alertas de risco."
              onRetry={() => alertsQuery.refetch()}
            />
          ) : alerts.length === 0 ? (
            <EmptyState
              icon={BellRing}
              title="Nenhum alerta registrado ainda."
              description="Acesse a tela Alerta de Risco e notifique a coordenação quando houver alunos com risco alto."
              action={
                <Button size="sm" onClick={() => navigate('/risco')}>
                  Ir para Alerta de Risco
                  <ArrowRight className="h-4 w-4" />
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Nenhum alerta encontrado"
              description="Ajuste a busca ou o filtro de status para ver outros casos."
            />
          ) : (
            <AlertList alerts={filtered} onUpdate={openIntervention} />
          )}
        </CardContent>
      </Card>

      <Modal
        open={Boolean(selected)}
        title="Registrar intervenção"
        description="Atualize o andamento e registre as providências adotadas."
        onClose={closeIntervention}
      >
        {selected && (
          <form
            className="space-y-5"
            onSubmit={handleSubmit(data => updateMutation.mutate(data))}
          >
            {feedback?.type === 'error' && (
              <InlineError message={feedback.message} />
            )}
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">
                    {selected.alunoNome}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selected.disciplinaNome}
                  </p>
                </div>
                <RiskBadge risk={selected.risco} />
              </div>
              {selected.motivos.length > 0 && (
                <ul className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm text-muted-foreground">
                  {selected.motivos.map(reason => (
                    <li key={reason} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <FormField label="Status" error={errors.status?.message}>
              <Select {...register('status')}>
                <option value="PENDENTE">Pendente</option>
                <option value="EM_ACOMPANHAMENTO">Em acompanhamento</option>
                <option value="RESOLVIDO">Resolvido</option>
              </Select>
            </FormField>
            <FormField
              label="Observação"
              error={errors.observacao?.message}
            >
              <Textarea
                placeholder="Descreva contatos, encaminhamentos e providências adotadas..."
                {...register('observacao')}
              />
            </FormField>
            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={closeIntervention}
                disabled={updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending
                  ? 'Salvando...'
                  : 'Salvar acompanhamento'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone = 'blue',
}: {
  icon: typeof BellRing;
  label: string;
  value: number;
  tone?: 'blue' | 'orange' | 'green';
}) {
  const tones = {
    blue: 'bg-primary/10 text-primary',
    orange: 'bg-accent/10 text-accent',
    green: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  };
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function AlertList({
  alerts,
  onUpdate,
}: {
  alerts: AlertaRisco[];
  onUpdate: (alert: AlertaRisco) => void;
}) {
  return (
    <>
      <div className="hidden xl:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Disciplina / professor</TableHead>
              <TableHead>Risco</TableHead>
              <TableHead>Média</TableHead>
              <TableHead>Faltas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map(alert => (
              <TableRow key={alert.id}>
                <TableCell>
                  <p className="font-semibold text-foreground">{alert.alunoNome}</p>
                  <p className="mt-1 text-xs">Matrícula {alert.alunoMatricula}</p>
                </TableCell>
                <TableCell>
                  <p className="text-foreground">{alert.disciplinaNome}</p>
                  <p className="mt-1 text-xs">Prof. {alert.professorNome}</p>
                </TableCell>
                <TableCell><RiskBadge risk={alert.risco} /></TableCell>
                <TableCell className="font-semibold text-foreground">{formatMedia(alert.media)}</TableCell>
                <TableCell>{alert.faltas ?? '—'}</TableCell>
                <TableCell><StatusBadge status={alert.status} /></TableCell>
                <TableCell>{formatDate(alert.criadoEm)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => onUpdate(alert)}>
                    Atualizar acompanhamento
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-4 xl:hidden">
        {alerts.map(alert => (
          <article key={alert.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-foreground">{alert.alunoNome}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Matrícula {alert.alunoMatricula}</p>
              </div>
              <StatusBadge status={alert.status} />
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Info label="Disciplina" value={alert.disciplinaNome} />
              <Info label="Professor" value={alert.professorNome} />
              <Info label="Média" value={formatMedia(alert.media)} />
              <Info label="Faltas" value={String(alert.faltas ?? '—')} />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-3"><RiskBadge risk={alert.risco} /><span className="text-xs text-muted-foreground">{formatDate(alert.criadoEm)}</span></div>
              <Button variant="outline" size="sm" onClick={() => onUpdate(alert)}>Atualizar</Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: StatusAlerta }) {
  const config = statusConfig[status];
  return <Badge className={config.className}>{config.label}</Badge>;
}

function RiskBadge({ risk }: { risk: NivelRiscoAlerta }) {
  return <Badge className={riskConfig[risk]}>{risk === 'MEDIO' ? 'MÉDIO' : risk}</Badge>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-foreground">{value}</p></div>;
}

function formatMedia(value?: number) {
  return value === undefined
    ? '—'
    : value.toLocaleString('pt-BR', { minimumFractionDigits: 1 });
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
}

function getUpdateError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return 'Não foi possível atualizar o alerta.';
  }
  if (!error.response) return 'Não foi possível conectar à API.';

  switch (error.response.status) {
    case 400:
      return 'Dados inválidos para atualizar o alerta.';
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    case 403:
      return 'Você não tem permissão para atualizar alertas.';
    case 404:
      return 'Alerta não encontrado.';
    default:
      return 'Não foi possível atualizar o alerta.';
  }
}

export default RiskInterventions;
