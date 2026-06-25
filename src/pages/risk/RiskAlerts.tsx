import { useMemo, useRef, useState } from 'react';

import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';

import {
  FeedbackBanner,
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
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/select';
import { getMatriculaContext } from '@/lib/academic';
import { usePagination } from '@/hooks/usePagination';
import { normalizeUserRole } from '@/lib/rbac';
import { listarAlunos } from '@/services/alunoService';
import { notificarCoordenacao } from '@/services/alertaRiscoService';
import { listarMatriculas } from '@/services/matriculaService';
import { getMeuPerfil } from '@/services/profileService';
import {
  buscarRiscoDaMatricula,
  listarRiscosDoProfessor,
  type NivelRisco,
  type RiscoResponse,
} from '@/services/riscoService';
import { listarTurmas } from '@/services/turmaService';

const riskConfig: Record<
  NivelRisco,
  {
    label: string;
    description: string;
    indicator: string;
    badge: string;
    border: string;
    bar: string;
  }
> = {
  ALTO: {
    label: 'Risco alto',
    description: 'Exige acompanhamento acadêmico prioritário.',
    indicator: 'bg-red-500 shadow-red-500/40',
    badge:
      'border border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300',
    border: 'border-red-500/25',
    bar: 'from-red-500 to-red-400',
  },
  MEDIO: {
    label: 'Risco médio',
    description: 'Recomenda atenção e acompanhamento preventivo.',
    indicator: 'bg-orange-500 shadow-orange-500/40',
    badge:
      'border border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300',
    border: 'border-orange-500/25',
    bar: 'from-orange-500 to-amber-400',
  },
  BAIXO: {
    label: 'Risco baixo',
    description: 'Situação acadêmica estável no momento.',
    indicator: 'bg-emerald-500 shadow-emerald-500/40',
    badge:
      'border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/25',
    bar: 'from-emerald-500 to-green-400',
  },
};

type RiskFilter = 'TODOS' | NivelRisco;

interface RiskCardData {
  key: string;
  alunoNome: string;
  alunoMatricula: string;
  disciplinaNome: string;
  professorNome: string;
  semestre: string;
  risk?: RiscoResponse;
  matriculaId: number;
  explicitSemester?: boolean;
}

function RiskAlerts() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [notifiedIds, setNotifiedIds] = useState<Set<number>>(
    () => new Set(),
  );
  const pendingIdRef = useRef<number | undefined>(undefined);
  const profileQuery = useQuery({
    queryKey: ['meu-perfil'],
    queryFn: getMeuPerfil,
  });
  const role = normalizeUserRole(profileQuery.data?.perfil);
  const notificationMutation = useMutation({
    mutationFn: notificarCoordenacao,
    onSuccess: async (_, matriculaId) => {
      setNotifiedIds(current => new Set(current).add(matriculaId));
      setFeedback({
        type: 'success',
        message: 'Coordenação notificada com sucesso.',
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['alertas-risco'] }),
        queryClient.invalidateQueries({ queryKey: ['riscos-professor'] }),
        queryClient.invalidateQueries({ queryKey: ['risco-matricula'] }),
      ]);
    },
    onError: error =>
      setFeedback({ type: 'error', message: getNotificationError(error) }),
    onSettled: () => {
      pendingIdRef.current = undefined;
    },
  });
  const notification: NotificationControls = {
    notify: matriculaId => {
      if (pendingIdRef.current !== undefined || notifiedIds.has(matriculaId)) {
        return;
      }
      pendingIdRef.current = matriculaId;
      setFeedback(null);
      notificationMutation.mutate(matriculaId);
    },
    pendingId: notificationMutation.isPending
      ? notificationMutation.variables
      : undefined,
    notifiedIds,
  };

  if (profileQuery.isLoading) {
    return (
      <Page>
        <Heading />
        <LoadingState label="Identificando sua visão de risco..." />
      </Page>
    );
  }

  if (profileQuery.isError || !role) {
    return (
      <Page>
        <Heading />
        <ErrorMessage
          message="Não foi possível identificar o perfil para carregar os riscos."
          onRetry={() => profileQuery.refetch()}
        />
      </Page>
    );
  }

  return role === 'PROFESSOR' ? (
    <ProfessorRiskView feedback={feedback} notification={notification} />
  ) : (
    <AdminRiskView feedback={feedback} notification={notification} />
  );
}

interface RiskViewProps {
  feedback: Feedback | null;
  notification: NotificationControls;
}

interface NotificationControls {
  notify: (matriculaId: number) => void;
  pendingId?: number;
  notifiedIds: Set<number>;
}

function ProfessorRiskView({ feedback, notification }: RiskViewProps) {
  const query = useQuery({
    queryKey: ['riscos-professor'],
    queryFn: listarRiscosDoProfessor,
  });

  if (query.isLoading) {
    return (
      <Page>
        <Heading professor />
        <LoadingState label="Carregando os riscos das suas turmas..." />
      </Page>
    );
  }

  if (query.isError) {
    return (
      <Page>
        <Heading professor />
        <ErrorMessage
          message="Não foi possível carregar os riscos das suas turmas."
          onRetry={() => query.refetch()}
        />
      </Page>
    );
  }

  if (!query.data?.length) {
    return (
      <Page>
        <Heading professor />
        <EmptyState
          icon={ShieldCheck}
          title="Nenhum aluno com risco encontrado nas suas turmas."
          description="Os indicadores aparecerão quando houver matrículas nas turmas vinculadas ao seu perfil."
        />
      </Page>
    );
  }

  const risks = query.data.map(item => ({
    key: `${item.matriculaId}-${item.disciplinaNome}`,
    alunoNome: item.alunoNome,
    alunoMatricula: item.alunoMatricula,
    disciplinaNome: item.disciplinaNome,
    professorNome: item.professorNome,
    semestre: item.semestre,
    risk: item,
    matriculaId: item.matriculaId,
    explicitSemester: true,
  }));

  return (
    <Page>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Heading professor />
        <Button variant="outline" size="sm" onClick={() => query.refetch()}>
          <RefreshCw className="h-4 w-4" />
          Atualizar riscos
        </Button>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} />}
      <RiskCardList risks={risks} notification={notification} />
      <RiskLegend />
    </Page>
  );
}

function AdminRiskView({ feedback, notification }: RiskViewProps) {
  const matriculasQuery = useQuery({
    queryKey: ['matriculas'],
    queryFn: listarMatriculas,
  });
  const alunosQuery = useQuery({ queryKey: ['alunos'], queryFn: listarAlunos });
  const turmasQuery = useQuery({ queryKey: ['turmas'], queryFn: listarTurmas });
  const matriculas = useMemo(
    () => matriculasQuery.data ?? [],
    [matriculasQuery.data],
  );
  const alunos = useMemo(() => alunosQuery.data ?? [], [alunosQuery.data]);
  const turmas = useMemo(() => turmasQuery.data ?? [], [turmasQuery.data]);
  const riskQueries = useQueries({
    queries: matriculas.map(matricula => ({
      queryKey: ['risco-matricula', matricula.id],
      queryFn: () => buscarRiscoDaMatricula(matricula.id),
    })),
  });
  const risksLoading = riskQueries.some(query => query.isPending);
  const failedCount = riskQueries.filter(query => query.isError).length;
  const totalFailure =
    matriculas.length > 0 && failedCount === matriculas.length;
  const refreshAll = () => {
    void matriculasQuery.refetch();
    riskQueries.forEach(query => void query.refetch());
  };

  if (matriculasQuery.isLoading) {
    return <Page><Heading /><LoadingState label="Carregando matrículas..." /></Page>;
  }
  if (matriculasQuery.isError) {
    return <Page><Heading /><ErrorMessage message="Não foi possível carregar as matrículas para analisar o risco." onRetry={() => matriculasQuery.refetch()} /></Page>;
  }
  if (matriculas.length === 0) {
    return <Page><Heading /><EmptyState icon={ShieldCheck} title="Nenhuma matrícula para analisar" description="O painel de risco será preenchido quando existirem matrículas cadastradas." /></Page>;
  }
  if (risksLoading) {
    return <Page><Heading /><LoadingState label="Calculando os níveis de risco..." /></Page>;
  }
  if (totalFailure) {
    return <Page><Heading /><ErrorMessage message="A análise de risco não respondeu para nenhuma matrícula." onRetry={refreshAll} /></Page>;
  }

  return (
    <Page>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Heading />
        <Button variant="outline" size="sm" onClick={refreshAll}>
          <RefreshCw className="h-4 w-4" />Atualizar riscos
        </Button>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} />}
      {failedCount > 0 && (
        <div className="rounded-2xl border border-accent/25 bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          {failedCount} matrícula(s) ficaram sem classificação. Os demais
          resultados continuam disponíveis.
        </div>
      )}
      <RiskCardList
        risks={matriculas.map((matricula, index) => {
          const risk = riskQueries[index]?.data;
          const context = getMatriculaContext(matricula, alunos, turmas);

          return {
            key: String(matricula.id),
            alunoNome: context.alunoLabel,
            alunoMatricula: context.alunoMatricula,
            disciplinaNome: context.disciplinaNome,
            professorNome: context.professorNome,
            semestre: context.turmaLabel,
            risk,
            matriculaId: matricula.id,
          };
        })}
        notification={notification}
      />
      <RiskLegend />
    </Page>
  );
}

function RiskCardList({
  risks,
  notification,
}: {
  risks: RiskCardData[];
  notification: NotificationControls;
}) {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('TODOS');
  const filteredRisks = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');

    return risks
      .filter(item => riskFilter === 'TODOS' || item.risk?.risco === riskFilter)
      .filter(item => {
        if (!term) return true;

        return [
          item.alunoNome,
          item.alunoMatricula,
          item.disciplinaNome,
          item.professorNome,
          item.semestre,
          item.risk?.risco,
          ...(item.risk?.motivos ?? []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('pt-BR')
          .includes(term);
      });
  }, [riskFilter, risks, search]);
  const pagination = usePagination(filteredRisks, {
    initialPageSize: 12,
    resetKey: `${search}|${riskFilter}`,
  });

  return (
    <Card>
      <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <CardTitle>Alertas analisados</CardTitle>
          <CardDescription className="mt-2">
            Busque, filtre por nível de risco e acompanhe os estudantes que
            precisam de atenção.
          </CardDescription>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-[1fr_180px] lg:max-w-2xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Buscar por aluno, matrícula, disciplina ou professor..."
              className="pl-9"
              aria-label="Buscar alertas de risco"
            />
          </div>
          <Select
            value={riskFilter}
            onChange={event => setRiskFilter(event.target.value as RiskFilter)}
            aria-label="Filtrar por nÃ­vel de risco"
          >
            <option value="TODOS">Todos</option>
            <option value="ALTO">Alto</option>
            <option value="MEDIO">Médio</option>
            <option value="BAIXO">Baixo</option>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRisks.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Nenhum alerta encontrado com os filtros selecionados."
            description="Ajuste a busca ou o nível de risco para visualizar outros registros."
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pagination.pageItems.map((item, index) => (
                <RiskCard
                  key={item.key}
                  index={index}
                  alunoNome={item.alunoNome}
                  alunoMatricula={item.alunoMatricula}
                  disciplinaNome={item.disciplinaNome}
                  professorNome={item.professorNome}
                  semestre={item.semestre}
                  risk={item.risk}
                  matriculaId={item.matriculaId}
                  notification={notification}
                  explicitSemester={item.explicitSemester}
                />
              ))}
            </div>
            <Pagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
              pageSizeOptions={[6, 12, 24, 48]}
              itemLabel="alertas"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface RiskCardProps {
  index: number;
  alunoNome: string;
  alunoMatricula: string;
  disciplinaNome: string;
  professorNome: string;
  semestre: string;
  risk?: RiscoResponse;
  matriculaId: number;
  notification: NotificationControls;
  explicitSemester?: boolean;
}

function RiskCard({
  index,
  alunoNome,
  alunoMatricula,
  disciplinaNome,
  professorNome,
  semestre,
  risk,
  matriculaId,
  notification,
  explicitSemester = false,
}: RiskCardProps) {
  const config = risk ? riskConfig[risk.risco] : null;
  const isPending = notification.pendingId === matriculaId;
  const notificationBusy = notification.pendingId !== undefined;
  const isNotified = notification.notifiedIds.has(matriculaId);
  const semesterDisplay =
    explicitSemester && semestre !== 'Semestre não informado'
      ? `Semestre ${semestre}`
      : semestre;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className={`relative h-full overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_-28px_rgba(15,23,42,0.5)] ${config?.border ?? 'border-border'}`}>
        <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${config?.bar ?? 'from-muted to-border'}`} />
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="leading-tight">{alunoNome}</CardTitle>
              <CardDescription className="mt-2">
                Matrícula {alunoMatricula} • {semesterDisplay}
              </CardDescription>
            </div>
            <span className={`mt-1 h-4 w-4 shrink-0 rounded-full shadow-[0_0_14px_3px] ${config?.indicator ?? 'bg-muted shadow-none'}`} aria-label={config?.label ?? 'Risco indisponível'} />
          </div>
        </CardHeader>
        <CardContent>
          <dl className="mb-4 grid gap-2 border-b border-border pb-4 text-sm">
            <div><dt className="text-xs text-muted-foreground">Disciplina</dt><dd className="text-foreground">{disciplinaNome}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Professor</dt><dd className="text-foreground">{professorNome}</dd></div>
            <div><dt className="text-xs text-muted-foreground">{explicitSemester ? 'Semestre' : 'Turma / semestre'}</dt><dd className="text-foreground">{semestre}</dd></div>
          </dl>
          {(risk?.media !== undefined || risk?.faltas !== undefined) && (
            <div className="mb-4 grid grid-cols-2 gap-3">
              <Metric label="Média atual" value={risk.media?.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} />
              <Metric label="Total de faltas" value={risk.faltas} />
            </div>
          )}
          {config ? (
            <>
              <span className={`inline-flex rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide ${config.badge}`}>{config.label}</span>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{config.description}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Não foi possível calcular o risco desta matrícula.</p>
          )}
          {risk?.motivos && risk.motivos.length > 0 && (
            <div className="mt-4 rounded-xl border border-accent/20 bg-secondary/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground">Sinais identificados</p>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {risk.motivos.map(motivo => <li key={motivo} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{motivo}</li>)}
              </ul>
            </div>
          )}
          {risk?.risco === 'ALTO' && (
            <div className="mt-5 border-t border-border pt-4">
              <Button
                variant="secondary"
                className="w-full bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-500 dark:text-slate-950 dark:hover:bg-orange-400"
                disabled={notificationBusy || isNotified}
                onClick={() => notification.notify(matriculaId)}
              >
                {isPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : isNotified ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <BellRing className="h-4 w-4" />
                )}
                {isPending
                  ? 'Notificando...'
                  : isNotified
                    ? 'Coordenação notificada'
                    : 'Notificar coordenação'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Metric({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined) return <div />;
  return <div className="rounded-xl border border-border bg-muted/40 p-3"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold text-foreground">{value}</p></div>;
}

function RiskLegend() {
  return (
    <Card>
      <CardHeader><CardTitle>Como interpretar o semáforo</CardTitle><CardDescription>O indicador ajuda a priorizar ações de acompanhamento pedagógico.</CardDescription></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {(Object.keys(riskConfig) as NivelRisco[]).map(level => {
          const config = riskConfig[level];
          return <div key={level} className="rounded-xl border border-border bg-muted/30 p-4 transition hover:border-primary/20 hover:bg-card"><div className="flex items-center gap-3"><span className={`h-3 w-3 rounded-full ${config.indicator}`} /><p className="font-semibold text-foreground">{config.label}</p></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{config.description}</p></div>;
        })}
      </CardContent>
    </Card>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</section>;
}

function Heading({ professor = false }: { professor?: boolean }) {
  return <div><div className="flex items-center gap-2 text-accent"><AlertTriangle className="h-4 w-4" /><p className="text-sm font-medium">Módulo inteligente</p></div><h1 className="mt-1 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">Alerta de Risco/Evasão</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{professor ? 'Acompanhe exclusivamente os estudantes das turmas vinculadas ao seu perfil.' : 'Identifique matrículas que precisam de acompanhamento antes que o problema se agrave.'}</p></div>;
}

function getNotificationError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return 'Não foi possível notificar a coordenação.';
  }
  if (!error.response) return 'Não foi possível conectar ao sistema.';

  const data = error.response.data as
    | string
    | { message?: string; mensagem?: string; erro?: string; error?: string }
    | undefined;
  const backendMessage =
    typeof data === 'string'
      ? data.trim()
      : data?.message ?? data?.mensagem ?? data?.erro ?? data?.error;

  switch (error.response.status) {
    case 400:
      return (
        backendMessage ||
        'Não foi possível notificar. Talvez a coordenação já tenha sido notificada sobre este alerta.'
      );
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    case 403:
      return 'Você não tem permissão para notificar a coordenação.';
    case 404:
      return 'Matrícula não encontrada.';
    default:
      return 'Não foi possível notificar a coordenação.';
  }
}

export default RiskAlerts;
