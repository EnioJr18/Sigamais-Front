import { useMemo } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getMatriculaContext } from '@/lib/academic';
import { listarAlunos } from '@/services/alunoService';
import { listarMatriculas } from '@/services/matriculaService';
import { buscarRiscoDaMatricula, type NivelRisco } from '@/services/riscoService';
import { listarTurmas } from '@/services/turmaService';

const riskConfig: Record<NivelRisco, {
  label: string;
  description: string;
  indicator: string;
  badge: string;
  border: string;
}> = {
  ALTO: {
    label: 'Risco alto',
    description: 'Exige acompanhamento acadêmico prioritário.',
    indicator: 'bg-red-500 shadow-red-500/40',
    badge: 'bg-red-500/10 text-red-700 dark:text-red-300',
    border: 'border-red-500/25',
  },
  MEDIO: {
    label: 'Risco médio',
    description: 'Recomenda atenção e acompanhamento preventivo.',
    indicator: 'bg-orange-500 shadow-orange-500/40',
    badge: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
    border: 'border-orange-500/25',
  },
  BAIXO: {
    label: 'Risco baixo',
    description: 'Situação acadêmica estável no momento.',
    indicator: 'bg-emerald-500 shadow-emerald-500/40',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/25',
  },
};

function RiskAlerts() {
  const matriculasQuery = useQuery({ queryKey: ['matriculas'], queryFn: listarMatriculas });
  const alunosQuery = useQuery({ queryKey: ['alunos'], queryFn: listarAlunos });
  const turmasQuery = useQuery({ queryKey: ['turmas'], queryFn: listarTurmas });
  const matriculas = useMemo(() => matriculasQuery.data ?? [], [matriculasQuery.data]);
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
  const totalFailure = matriculas.length > 0 && failedCount === matriculas.length;

  const refreshAll = () => {
    matriculasQuery.refetch();
    riskQueries.forEach(query => query.refetch());
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
        <Button variant="outline" size="sm" onClick={refreshAll}><RefreshCw className="h-4 w-4" />Atualizar riscos</Button>
      </div>

      {failedCount > 0 && (
        <div className="rounded-2xl border border-accent/25 bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          {failedCount} matrícula(s) ficaram sem classificação. Os demais resultados continuam disponíveis.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {matriculas.map((matricula, index) => {
          const level = riskQueries[index]?.data?.risco;
          const context = getMatriculaContext(matricula, alunos, turmas);
          const config = level ? riskConfig[level] : null;

          return (
            <motion.div key={matricula.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
              <Card className={`h-full ${config?.border ?? 'border-border'}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div><CardTitle className="leading-tight">{context.alunoLabel}</CardTitle><CardDescription className="mt-2">Matrícula {context.alunoMatricula} • {context.turmaLabel}</CardDescription></div>
                    <span className={`mt-1 h-4 w-4 shrink-0 rounded-full shadow-[0_0_14px_3px] ${config?.indicator ?? 'bg-muted shadow-none'}`} aria-label={config?.label ?? 'Risco indisponível'} />
                  </div>
                </CardHeader>
                <CardContent>
                  <dl className="mb-4 grid gap-2 border-b border-border pb-4 text-sm">
                    <div><dt className="text-xs text-muted-foreground">Disciplina</dt><dd className="text-foreground">{context.disciplinaNome}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">Professor</dt><dd className="text-foreground">{context.professorNome}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">Turma / semestre</dt><dd className="text-foreground">{context.turmaLabel}</dd></div>
                  </dl>
                  {config ? <><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}>{config.label}</span><p className="mt-4 text-sm leading-6 text-muted-foreground">{config.description}</p></> : <><span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">Indisponível</span><p className="mt-4 text-sm text-muted-foreground">Não foi possível calcular o risco desta matrícula.</p></>}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Como interpretar o semáforo</CardTitle><CardDescription>O indicador ajuda a priorizar ações de acompanhamento pedagógico.</CardDescription></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {(Object.keys(riskConfig) as NivelRisco[]).map(level => {
            const config = riskConfig[level];
            return <div key={level} className="rounded-2xl border border-border bg-muted/30 p-4"><div className="flex items-center gap-3"><span className={`h-3 w-3 rounded-full ${config.indicator}`} /><p className="font-medium text-foreground">{config.label}</p></div><p className="mt-2 text-sm text-muted-foreground">{config.description}</p></div>;
          })}
        </CardContent>
      </Card>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</section>;
}

function Heading() {
  return <div><div className="flex items-center gap-2 text-accent"><AlertTriangle className="h-4 w-4" /><p className="text-sm font-medium">Módulo inteligente</p></div><h1 className="mt-1 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">Alerta de Risco/Evasão</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Identifique matrículas que precisam de acompanhamento antes que o problema se agrave.</p></div>;
}

export default RiskAlerts;
