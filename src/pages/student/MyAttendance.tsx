import { useQuery } from '@tanstack/react-query';
import { CalendarCheck, ClipboardList } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { listarMinhaFrequencia } from '@/services/studentPortalService';

import { StudentPage } from './StudentPage';

function MyAttendance() {
  const query = useQuery({
    queryKey: ['portal-aluno', 'frequencias'],
    queryFn: listarMinhaFrequencia,
  });

  return (
    <StudentPage
      icon={CalendarCheck}
      title="Minha frequência"
      description="Consulte o total consolidado de faltas e lançamentos por disciplina."
    >
      {query.isLoading && <LoadingState label="Carregando sua frequência..." />}
      {query.isError && <ErrorMessage message="Não foi possível carregar sua frequência." onRetry={() => query.refetch()} />}
      {query.data?.length === 0 && <EmptyState icon={ClipboardList} title="Nenhum registro de frequência" description="Os registros aparecerão aqui após os lançamentos dos professores." />}
      {query.data && query.data.length > 0 && (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader><TableRow><TableHead>Disciplina</TableHead><TableHead>Professor</TableHead><TableHead>Semestre</TableHead><TableHead>Total de faltas</TableHead><TableHead>Lançamentos</TableHead></TableRow></TableHeader>
              <TableBody>{query.data.map(item => <TableRow key={item.matriculaId}><TableCell className="font-medium text-foreground">{item.disciplinaNome}</TableCell><TableCell>{item.professorNome}</TableCell><TableCell>{item.semestre}</TableCell><TableCell><Badge className={item.totalFaltas > 0 ? 'bg-orange-500/10 text-orange-700 ring-orange-500/20 dark:text-orange-300' : 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300'}>{item.totalFaltas} falta(s)</Badge></TableCell><TableCell>{item.quantidadeRegistros}</TableCell></TableRow>)}</TableBody>
            </Table>
          </div>
          <div className="grid gap-4 md:hidden">
            {query.data.map(item => <Card key={item.matriculaId}><CardContent className="p-5"><p className="font-semibold text-foreground">{item.disciplinaNome}</p><p className="mt-1 text-sm text-muted-foreground">{item.professorNome} · {item.semestre}</p><div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4"><div><p className="text-xs text-muted-foreground">Total de faltas</p><p className="mt-1 text-xl font-bold text-foreground">{item.totalFaltas}</p></div><div><p className="text-xs text-muted-foreground">Lançamentos</p><p className="mt-1 text-xl font-bold text-foreground">{item.quantidadeRegistros}</p></div></div></CardContent></Card>)}
          </div>
        </>
      )}
    </StudentPage>
  );
}

export default MyAttendance;
