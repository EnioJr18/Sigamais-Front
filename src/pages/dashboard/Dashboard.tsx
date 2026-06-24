import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ArrowUpRight,
  GraduationCap,
  RefreshCw,
  School,
  UserRound,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  buscarResumoDashboard,
  type DashboardResource,
} from '@/services/dashboardService';

const cards: Array<{
  key: DashboardResource;
  label: string;
  description: string;
  href: string;
  icon: typeof Users;
  tone: string;
}> = [
  {
    key: 'alunos',
    label: 'Alunos',
    description: 'Estudantes cadastrados',
    href: '/alunos',
    icon: Users,
    tone: 'from-primary/20 to-primary/5 text-primary',
  },
  {
    key: 'professores',
    label: 'Professores',
    description: 'Docentes ativos',
    href: '/professores',
    icon: UserRound,
    tone: 'from-accent/20 to-accent/5 text-accent',
  },
  {
    key: 'turmas',
    label: 'Turmas',
    description: 'Turmas disponíveis',
    href: '/turmas',
    icon: GraduationCap,
    tone: 'from-primary/15 to-primary/5 text-primary',
  },
  {
    key: 'disciplinas',
    label: 'Disciplinas',
    description: 'Componentes curriculares',
    href: '/disciplinas',
    icon: BookOpen,
    tone: 'from-accent/25 to-accent/5 text-accent',
  },
  {
    key: 'matriculas',
    label: 'Matrículas',
    description: 'Vínculos acadêmicos',
    href: '/matriculas',
    icon: School,
    tone: 'from-primary/20 via-accent/10 to-accent/5 text-accent',
  },
];

function Dashboard() {
  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: buscarResumoDashboard,
  });

  if (summaryQuery.isLoading) {
    return (
      <PageContainer>
        <PageHeading />
        <LoadingState label="Consultando os dados acadêmicos..." />
      </PageContainer>
    );
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <PageContainer>
        <PageHeading />
        <ErrorMessage
          message="Não foi possível carregar os indicadores acadêmicos. Tente novamente em instantes."
          onRetry={() => summaryQuery.refetch()}
        />
      </PageContainer>
    );
  }

  const { data } = summaryQuery;
  const isEmpty = cards.every(card => data[card.key] === 0);

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeading />
        <Button
          variant="outline"
          size="sm"
          onClick={() => summaryQuery.refetch()}
          disabled={summaryQuery.isFetching}
          className="self-start sm:self-auto"
        >
          <RefreshCw
            className={`h-4 w-4 ${summaryQuery.isFetching ? 'animate-spin' : ''}`}
          />
          Atualizar dados
        </Button>
      </div>

      {data.unavailable.length > 0 && (
        <div className="rounded-2xl border border-accent/25 bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          Alguns indicadores estão temporariamente indisponíveis:{' '}
          {data.unavailable.join(', ')}. As demais informações continuam disponíveis.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, index) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={card.href} className="group block h-full">
              <Card className="relative h-full overflow-hidden transition duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-[0_20px_40px_-26px_rgba(21,87,166,0.45)]">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-accent opacity-70" />
                <CardContent className="p-5 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`inline-flex rounded-xl bg-gradient-to-br p-3 ring-1 ring-inset ring-current/10 ${card.tone}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <p className="mt-6 text-4xl font-bold tracking-tight text-foreground">
                    {data[card.key] ?? '—'}
                  </p>
                  <p className="mt-1.5 font-semibold text-foreground">{card.label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {data[card.key] === null
                      ? 'Dado indisponível'
                      : card.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {isEmpty && (
        <EmptyState
          icon={School}
          title="A base acadêmica ainda está vazia"
          description="Cadastre os primeiros alunos, professores, disciplinas e turmas para acompanhar os indicadores por aqui."
        />
      )}

      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-siga-blue-50/70 dark:to-card">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Sobre o SIGA+
            </span>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              Gestão acadêmica integrada e acompanhamento inteligente
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              O SIGA+ reúne informações de alunos, professores, turmas,
              matrículas, notas e frequência em um único ambiente. A plataforma
              apoia a gestão acadêmica e ajuda a identificar estudantes que
              precisam de acompanhamento pedagógico.
            </p>
          </div>
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
            <p className="text-sm font-medium text-primary">
              Diferencial do sistema
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              O Alerta de Risco Acadêmico auxilia professores e coordenação na
              identificação precoce de alunos com baixo desempenho ou excesso
              de faltas, permitindo ações antes que o problema se agrave.
            </p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {children}
    </section>
  );
}

function PageHeading() {
  return (
    <div>
      <p className="text-sm font-medium text-accent">Visão geral</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
        Dashboard acadêmico
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Acompanhe os principais números da instituição em um só lugar.
      </p>
    </div>
  );
}

export default Dashboard;
