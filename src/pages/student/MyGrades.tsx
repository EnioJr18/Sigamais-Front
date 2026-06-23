import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { BookOpenCheck, ClipboardCheck, ListChecks } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  listarMinhasNotas,
  type MinhaNota,
  type SituacaoAluno,
} from '@/services/studentPortalService';

import { StudentPage } from './StudentPage';

const situationStyles: Record<SituacaoAluno, string> = {
  APROVADO:
    'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  RECUPERACAO:
    'bg-orange-500/10 text-orange-700 ring-orange-500/20 dark:text-orange-300',
  REPROVADO:
    'bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-300',
};

function SituationBadge({ situation }: { situation: SituacaoAluno }) {
  return (
    <Badge className={situationStyles[situation]}>
      {situation === 'RECUPERACAO' ? 'RECUPERAÇÃO' : situation}
    </Badge>
  );
}

function formatGrade(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 1 });
}

function MyGrades() {
  const [details, setDetails] = useState<MinhaNota | null>(null);
  const query = useQuery({
    queryKey: ['portal-aluno', 'notas'],
    queryFn: listarMinhasNotas,
  });

  return (
    <StudentPage
      icon={BookOpenCheck}
      title="Minhas notas"
      description="Acompanhe sua média, situação acadêmica e avaliações em cada disciplina."
    >
      {query.isLoading && <LoadingState label="Carregando seu boletim..." />}
      {query.isError && (
        <ErrorMessage
          message="Não foi possível carregar suas notas."
          onRetry={() => query.refetch()}
        />
      )}
      {query.data?.length === 0 && (
        <EmptyState
          icon={ClipboardCheck}
          title="Nenhuma nota disponível"
          description="Seu boletim será atualizado quando os lançamentos forem realizados."
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
                  <TableHead>Média</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.map(nota => (
                  <TableRow key={nota.matriculaId}>
                    <TableCell className="font-medium text-foreground">
                      {nota.disciplinaNome}
                    </TableCell>
                    <TableCell>{nota.professorNome}</TableCell>
                    <TableCell>{nota.semestre}</TableCell>
                    <TableCell className="text-base font-semibold text-foreground">
                      {formatGrade(nota.media)}
                    </TableCell>
                    <TableCell>{nota.quantidadeNotas}</TableCell>
                    <TableCell>
                      <SituationBadge situation={nota.situacao} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDetails(nota)}
                      >
                        Ver detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 md:hidden">
            {query.data.map(nota => (
              <Card key={nota.matriculaId}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        {nota.disciplinaNome}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {nota.professorNome} · {nota.semestre}
                      </p>
                    </div>
                    <SituationBadge situation={nota.situacao} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Média</p>
                      <p className="mt-1 text-xl font-bold text-foreground">
                        {formatGrade(nota.media)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Notas lançadas
                      </p>
                      <p className="mt-1 text-xl font-bold text-foreground">
                        {nota.quantidadeNotas}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => setDetails(nota)}
                  >
                    <ListChecks className="h-4 w-4" />
                    Ver detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Modal
        open={Boolean(details)}
        title={details?.disciplinaNome ?? 'Detalhes das notas'}
        description={
          details
            ? `${details.professorNome} · ${details.semestre}`
            : undefined
        }
        onClose={() => setDetails(null)}
      >
        {details && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Média
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {formatGrade(details.media)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Situação
                </p>
                <div className="mt-2">
                  <SituationBadge situation={details.situacao} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Notas individuais
              </h3>
              {details.notas.length === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                  Nenhuma nota individual disponível para esta disciplina.
                </div>
              ) : (
                <div className="mt-3 overflow-hidden rounded-xl border border-border">
                  <div className="grid grid-cols-[1fr_auto] bg-muted/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>Tipo</span>
                    <span>Valor</span>
                  </div>
                  {details.notas.map(nota => (
                    <div
                      key={nota.id}
                      className="grid grid-cols-[1fr_auto] border-t border-border px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-foreground">
                        {nota.tipo || 'Não informado'}
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatGrade(nota.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-border pt-4">
              <Button onClick={() => setDetails(null)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>
    </StudentPage>
  );
}

export default MyGrades;
