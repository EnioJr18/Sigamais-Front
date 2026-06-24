import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookMarked, Plus, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  DeleteConfirmation,
  FeedbackBanner,
  FormField,
  InlineError,
  RowActions,
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
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { canManageStructure } from '@/lib/rbac';
import { usePagination } from '@/hooks/usePagination';
import {
  atualizarDisciplina,
  criarDisciplina,
  excluirDisciplina,
  getDisciplinaName,
  getDisciplinaWorkload,
  listarDisciplinas,
  type Disciplina,
  type DisciplinaPayload,
} from '@/services/disciplinaService';
import { getApiErrorMessage } from '@/services/http';

const disciplinaSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome da disciplina.'),
  cargaHoraria: z.coerce
    .number<number>()
    .int('Use um número inteiro.')
    .min(1, 'A carga horária deve ser maior que zero.')
    .max(1000, 'Informe uma carga horária válida.'),
});

type DisciplinaFormData = z.infer<typeof disciplinaSchema>;

const emptyForm: DisciplinaFormData = { nome: '', cargaHoraria: 60 };

function Disciplines() {
  const queryClient = useQueryClient();
  const canManage = canManageStructure();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Disciplina | null>(null);
  const [deleting, setDeleting] = useState<Disciplina | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const disciplinasQuery = useQuery({
    queryKey: ['disciplinas'],
    queryFn: listarDisciplinas,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DisciplinaFormData>({
    resolver: zodResolver(disciplinaSchema),
    defaultValues: emptyForm,
  });

  const refreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['disciplinas'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: (payload: DisciplinaPayload) =>
      editing
        ? atualizarDisciplina(editing.id, payload)
        : criarDisciplina(payload),
    onSuccess: async () => {
      const action = editing ? 'atualizada' : 'cadastrada';
      await refreshData();
      setFeedback({
        type: 'success',
        message: `Disciplina ${action} com sucesso.`,
      });
      closeForm();
    },
    onError: error =>
      setFeedback({
        type: 'error',
        message: getApiErrorMessage(
          error,
          'Não foi possível salvar a disciplina.',
        ),
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: excluirDisciplina,
    onSuccess: async () => {
      await refreshData();
      setDeleting(null);
      setFeedback({
        type: 'success',
        message: 'Disciplina excluída com sucesso.',
      });
    },
    onError: error =>
      setFeedback({
        type: 'error',
        message: getApiErrorMessage(
          error,
          'Não foi possível excluir a disciplina.',
        ),
      }),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    if (!term) return disciplinasQuery.data ?? [];

    return (disciplinasQuery.data ?? []).filter(disciplina =>
      [getDisciplinaName(disciplina), getDisciplinaWorkload(disciplina)]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(term),
    );
  }, [disciplinasQuery.data, search]);
  const pagination = usePagination(filtered, { resetKey: search });

  function openCreate() {
    setEditing(null);
    setFeedback(null);
    reset(emptyForm);
    setFormOpen(true);
  }

  function openEdit(disciplina: Disciplina) {
    setEditing(disciplina);
    setFeedback(null);
    reset({
      nome: getDisciplinaName(disciplina),
      cargaHoraria: getDisciplinaWorkload(disciplina),
    });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    reset(emptyForm);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Estrutura acadêmica</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            Disciplinas
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gerencie os componentes curriculares e suas cargas horárias.
          </p>
        </div>
        {canManage && (
          <Button
            onClick={openCreate}
            className="self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Nova disciplina
          </Button>
        )}
      </div>

      {feedback && !formOpen && !deleting && (
        <FeedbackBanner feedback={feedback} />
      )}

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Disciplinas cadastradas</CardTitle>
            <CardDescription className="mt-2">
              Componentes curriculares organizados para consulta e gestão.
            </CardDescription>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Buscar por nome ou carga horária"
              className="pl-9"
              aria-label="Buscar disciplinas"
            />
          </div>
        </CardHeader>
        <CardContent>
          {disciplinasQuery.isLoading ? (
            <LoadingState label="Carregando disciplinas..." />
          ) : disciplinasQuery.isError ? (
            <ErrorMessage
              message="Não foi possível consultar as disciplinas."
              onRetry={() => disciplinasQuery.refetch()}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={BookMarked}
              title={search ? 'Nenhuma disciplina encontrada' : 'Nenhuma disciplina cadastrada'}
              description={
                search
                  ? 'Tente buscar por outro nome ou carga horária.'
                  : 'Cadastre a primeira disciplina da estrutura acadêmica.'
              }
              action={
                canManage && !search ? (
                  <Button size="sm" onClick={openCreate}>
                    <Plus className="h-4 w-4" />
                    Cadastrar disciplina
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <DisciplineList
                disciplinas={pagination.pageItems}
                canManage={false}
                onEdit={openEdit}
                onDelete={item => {
                  setFeedback(null);
                  setDeleting(item);
                }}
              />
              <Pagination
                page={pagination.page}
                pageSize={pagination.pageSize}
                totalItems={pagination.totalItems}
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
                itemLabel="disciplinas"
              />
            </>
          )}
        </CardContent>
      </Card>

      <Modal
        open={formOpen}
        title={editing ? 'Editar disciplina' : 'Cadastrar disciplina'}
        description="Preencha os dados da disciplina."
        onClose={closeForm}
      >
        <form
          onSubmit={handleSubmit(data => saveMutation.mutate(data))}
          className="space-y-4"
        >
          {feedback?.type === 'error' && (
            <InlineError message={feedback.message} />
          )}
          <FormField label="Nome" error={errors.nome?.message}>
            <Input placeholder="Ex.: Matemática" {...register('nome')} />
          </FormField>
          <FormField
            label="Carga horária"
            error={errors.cargaHoraria?.message}
          >
            <Input
              type="number"
              min="1"
              placeholder="60"
              {...register('cargaHoraria')}
            />
          </FormField>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={closeForm}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending
                ? 'Salvando...'
                : editing
                  ? 'Salvar alterações'
                  : 'Cadastrar disciplina'}
            </Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmation
        open={Boolean(deleting)}
        entityLabel="disciplina"
        itemLabel={deleting ? getDisciplinaName(deleting) : ''}
        pending={deleteMutation.isPending}
        error={feedback?.type === 'error' ? feedback.message : undefined}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </motion.section>
  );
}

function DisciplineList({
  disciplinas,
  canManage,
  onEdit,
  onDelete,
}: {
  disciplinas: Disciplina[];
  canManage: boolean;
  onEdit: (item: Disciplina) => void;
  onDelete: (item: Disciplina) => void;
}) {
  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Carga horária</TableHead>
              {canManage && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {disciplinas.map(disciplina => (
              <TableRow key={disciplina.id}>
                <TableCell className="font-medium text-foreground">
                  {getDisciplinaName(disciplina)}
                </TableCell>
                <TableCell>{getDisciplinaWorkload(disciplina)}h</TableCell>
                {canManage && (
                  <TableCell>
                    <RowActions
                      item={disciplina}
                      label={getDisciplinaName(disciplina)}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-3 md:hidden">
        {disciplinas.map(disciplina => (
          <article
            key={disciplina.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <h3 className="font-medium text-foreground">
              {getDisciplinaName(disciplina)}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {getDisciplinaWorkload(disciplina)} horas
            </p>
            {canManage && (
              <div className="mt-4 border-t border-border pt-3">
                <RowActions
                  item={disciplina}
                  label={getDisciplinaName(disciplina)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

export default Disciplines;
