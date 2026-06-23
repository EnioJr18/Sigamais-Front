import { useQuery } from '@tanstack/react-query';
import { BookOpen, GraduationCap, UserRound } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { listarMinhasTurmas } from '@/services/studentPortalService';

import { StudentPage } from './StudentPage';

function MyClasses() {
  const query = useQuery({
    queryKey: ['portal-aluno', 'turmas'],
    queryFn: listarMinhasTurmas,
  });

  return (
    <StudentPage
      icon={GraduationCap}
      title="Minhas turmas"
      description="Consulte as disciplinas e turmas em que você está matriculado."
    >
      {query.isLoading && <LoadingState label="Carregando suas turmas..." />}
      {query.isError && (
        <ErrorMessage
          message="Não foi possível carregar suas turmas."
          onRetry={() => query.refetch()}
        />
      )}
      {query.data?.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="Nenhuma turma encontrada"
          description="Quando houver matrículas ativas, suas turmas aparecerão aqui."
        />
      )}
      {query.data && query.data.length > 0 && (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Semestre</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Matrícula</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.map(turma => (
                  <TableRow key={turma.id}>
                    <TableCell className="font-medium text-foreground">
                      {turma.disciplinaNome}
                    </TableCell>
                    <TableCell>{turma.professorNome}</TableCell>
                    <TableCell><Badge variant="outline">{turma.semestre}</Badge></TableCell>
                    <TableCell>{turma.ano}</TableCell>
                    <TableCell>#{turma.id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 md:hidden">
            {query.data.map(turma => (
              <Card key={turma.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{turma.disciplinaNome}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <UserRound className="h-3.5 w-3.5" />{turma.professorNome}
                      </p>
                    </div>
                    <Badge>{turma.semestre}</Badge>
                  </div>
                  <div className="mt-4 flex justify-between border-t border-border pt-3 text-sm text-muted-foreground">
                    <span>Ano {turma.ano}</span>
                    <span>Matrícula #{turma.id}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </StudentPage>
  );
}

export default MyClasses;
