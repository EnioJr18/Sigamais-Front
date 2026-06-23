import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Siren } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { listarMeuRisco, type NivelRiscoAluno } from '@/services/studentPortalService';

import { StudentPage } from './StudentPage';

const riskStyles: Record<NivelRiscoAluno, { label: string; dot: string; badge: string; border: string }> = {
  BAIXO: { label: 'Risco baixo', dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500/25' },
  MEDIO: { label: 'Risco médio', dot: 'bg-orange-500', badge: 'bg-orange-500/10 text-orange-700 dark:text-orange-300', border: 'border-orange-500/25' },
  ALTO: { label: 'Risco alto', dot: 'bg-red-500', badge: 'bg-red-500/10 text-red-700 dark:text-red-300', border: 'border-red-500/25' },
};

function MyRisk() {
  const query = useQuery({
    queryKey: ['portal-aluno', 'risco'],
    queryFn: listarMeuRisco,
  });

  return (
    <StudentPage icon={Siren} title="Meu risco acadêmico" description="Acompanhe os indicadores que ajudam a identificar quando uma disciplina precisa de mais atenção.">
      {query.isLoading && <LoadingState label="Analisando seu risco acadêmico..." />}
      {query.isError && <ErrorMessage message="Não foi possível carregar sua análise de risco." onRetry={() => query.refetch()} />}
      {query.data?.length === 0 && <EmptyState icon={ShieldCheck} title="Nenhum risco para analisar" description="Seus indicadores serão apresentados quando houver disciplinas matriculadas." />}
      {query.data && query.data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {query.data.map((item, index) => {
            const style = riskStyles[item.risco.risco];
            return (
              <Card key={`${item.disciplinaNome}-${index}`} className={`h-full overflow-hidden ${style.border}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="leading-tight">{item.disciplinaNome}</CardTitle>
                    <span className={`h-4 w-4 shrink-0 rounded-full shadow-[0_0_12px_2px] ${style.dot}`} aria-label={style.label} />
                  </div>
                </CardHeader>
                <CardContent>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${style.badge}`}>{style.label}</span>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Média</p><p className="mt-1 text-xl font-bold text-foreground">{item.risco.media?.toLocaleString('pt-BR', { minimumFractionDigits: 1 }) ?? '—'}</p></div>
                    <div className="rounded-xl border border-border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Faltas</p><p className="mt-1 text-xl font-bold text-foreground">{item.risco.faltas ?? '—'}</p></div>
                  </div>
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Motivos</p>
                    {item.risco.motivos.length > 0 ? <ul className="mt-2 space-y-2 text-sm text-muted-foreground">{item.risco.motivos.map(motivo => <li key={motivo} className="flex gap-2"><span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />{motivo}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">Nenhum motivo adicional informado.</p>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </StudentPage>
  );
}

export default MyRisk;
