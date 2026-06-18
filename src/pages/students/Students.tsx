import type { FormEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { motion } from 'framer-motion';
import { Plus, Search, Users } from 'lucide-react';

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
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  classes,
  findClassGroup,
  nextId,
  students as seedStudents,
  type Student,
  statusTone,
} from '@/lib/school-data';

type StudentForm = Omit<Student, 'id'>;

const emptyForm: StudentForm = {
  name: '',
  registration: '',
  classId: classes[0]?.id ?? 1,
  guardian: '',
  status: 'Ativo',
};

function Students() {
  const [items, setItems] = useState(seedStudents);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(
    () =>
      items.filter(item => {
        const classGroup = findClassGroup(item.classId);
        const haystack = [
          item.name,
          item.registration,
          item.guardian,
          item.status,
          classGroup?.name,
        ]
          .join(' ')
          .toLowerCase();

        const matchesSearch = haystack.includes(search.toLowerCase());
        const matchesClass =
          classFilter === 'all' || String(item.classId) === classFilter;

        return matchesSearch && matchesClass;
      }),
    [items, search, classFilter],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setItems(current => {
      const newItem = { id: nextId(current), ...form };
      setForm({
        ...emptyForm,
        registration: `2025-${String(newItem.id).padStart(3, '0')}`,
      });
      return [...current, newItem];
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 px-4 py-6 sm:px-6 lg:px-8"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 text-sky-200">
            <Users className="h-5 w-5" />
            <CardTitle>Alunos</CardTitle>
          </div>
          <CardDescription>
            Cadastro com vínculo direto à turma e filtro por relacionamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome">
                <Input
                  value={form.name}
                  onChange={event =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Nome do aluno"
                />
              </Field>
              <Field label="Matrícula">
                <Input
                  value={form.registration}
                  onChange={event =>
                    setForm({ ...form, registration: event.target.value })
                  }
                  placeholder="2025A007"
                />
              </Field>
              <Field label="Turma">
                <Select
                  value={String(form.classId)}
                  onChange={event =>
                    setForm({ ...form, classId: Number(event.target.value) })
                  }
                >
                  {classes.map(classGroup => (
                    <option key={classGroup.id} value={classGroup.id}>
                      {classGroup.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Responsável">
                <Input
                  value={form.guardian}
                  onChange={event =>
                    setForm({ ...form, guardian: event.target.value })
                  }
                  placeholder="Nome do responsável"
                />
              </Field>
              <Field label="Status">
                <Select
                  value={form.status}
                  onChange={event =>
                    setForm({
                      ...form,
                      status: event.target.value as Student['status'],
                    })
                  }
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Transferido">Transferido</option>
                </Select>
              </Field>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Badge variant="soft">
                Os alunos são usados como filtro nas notas e frequência
              </Badge>
              <Button type="submit">
                <Plus className="h-4 w-4" />
                Cadastrar
              </Button>
            </div>
          </form>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <Field label="Filtro">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-9"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Buscar por aluno, matrícula, responsável ou turma"
                />
              </div>
            </Field>
            <Field label="Turma">
              <Select
                value={classFilter}
                onChange={event => setClassFilter(event.target.value)}
              >
                <option value="all">Todas as turmas</option>
                {classes.map(classGroup => (
                  <option key={classGroup.id} value={classGroup.id}>
                    {classGroup.name}
                  </option>
                ))}
              </Select>
            </Field>
            <MiniStat label="Alunos" value={items.length} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listagem</CardTitle>
          <CardDescription>
            Visualização em datagrid com a turma e o status do aluno.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.registration}</TableCell>
                  <TableCell>
                    {findClassGroup(item.classId)?.name ?? '-'}
                  </TableCell>
                  <TableCell>{item.guardian}</TableCell>
                  <TableCell>
                    <Badge className={statusTone[item.status]}>
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default Students;
