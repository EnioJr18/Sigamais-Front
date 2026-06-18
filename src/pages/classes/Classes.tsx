import type { ReactNode, FormEvent } from 'react';
import { useMemo, useState } from 'react';

import { motion } from 'framer-motion';
import { GraduationCap, Plus, Search } from 'lucide-react';

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
  classes as seedClasses,
  disciplines,
  findProfessor,
  nextId,
  professors,
  type ClassGroup,
} from '@/lib/school-data';

type ClassForm = Omit<ClassGroup, 'id' | 'disciplineIds'> & {
  disciplineIds: string;
};

const emptyForm: ClassForm = {
  name: '',
  year: '2025',
  shift: 'Matutino',
  room: '',
  professorId: professors[0]?.id ?? 1,
  disciplineIds: '',
};

function Classes() {
  const [items, setItems] = useState(seedClasses);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(
    () =>
      items.filter(item => {
        const professor = findProfessor(item.professorId);
        const disciplineNames = item.disciplineIds
          .map(id => disciplines.find(discipline => discipline.id === id)?.name)
          .filter(Boolean)
          .join(' ');

        const haystack = [
          item.name,
          item.year,
          item.shift,
          item.room,
          professor?.name,
          disciplineNames,
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(search.toLowerCase());
      }),
    [items, search],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setItems(current => [
      ...current,
      {
        id: nextId(current),
        name: form.name,
        year: form.year,
        shift: form.shift,
        room: form.room,
        professorId: Number(form.professorId),
        disciplineIds: form.disciplineIds
          .split(',')
          .map(value => Number(value.trim()))
          .filter(Number.isFinite),
      },
    ]);
    setForm(emptyForm);
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
            <GraduationCap className="h-5 w-5" />
            <CardTitle>Turmas</CardTitle>
          </div>
          <CardDescription>
            Cadastro com professor responsável e disciplinas vinculadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Turma">
                <Input
                  value={form.name}
                  onChange={event =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Ex.: 1A"
                />
              </Field>
              <Field label="Ano">
                <Input
                  value={form.year}
                  onChange={event =>
                    setForm({ ...form, year: event.target.value })
                  }
                  placeholder="2025"
                />
              </Field>
              <Field label="Turno">
                <Select
                  value={form.shift}
                  onChange={event =>
                    setForm({ ...form, shift: event.target.value })
                  }
                >
                  <option>Matutino</option>
                  <option>Vespertino</option>
                  <option>Noturno</option>
                </Select>
              </Field>
              <Field label="Sala">
                <Input
                  value={form.room}
                  onChange={event =>
                    setForm({ ...form, room: event.target.value })
                  }
                  placeholder="Sala 101"
                />
              </Field>
              <Field label="Professor responsável">
                <Select
                  value={String(form.professorId)}
                  onChange={event =>
                    setForm({
                      ...form,
                      professorId: Number(event.target.value),
                    })
                  }
                >
                  {professors.map(professor => (
                    <option key={professor.id} value={professor.id}>
                      {professor.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Disciplinas">
                <Input
                  value={form.disciplineIds}
                  onChange={event =>
                    setForm({ ...form, disciplineIds: event.target.value })
                  }
                  placeholder="IDs separados por vírgula, ex.: 1,2,3"
                />
              </Field>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Badge variant="soft">
                Use os IDs das disciplinas listadas no filtro de notas
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
                  placeholder="Buscar por turma, sala, professor ou disciplina"
                />
              </div>
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat label="Turmas" value={items.length} />
              <MiniStat label="Disciplinas" value={disciplines.length} />
              <MiniStat label="Professores" value={professors.length} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listagem</CardTitle>
          <CardDescription>
            Turmas com relações principais exibidas em colunas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Turma</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Disciplinas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => {
                const professor = findProfessor(item.professorId);

                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>{item.shift}</TableCell>
                    <TableCell>{professor?.name ?? '-'}</TableCell>
                    <TableCell>
                      {item.disciplineIds
                        .map(
                          id =>
                            disciplines.find(discipline => discipline.id === id)
                              ?.name,
                        )
                        .filter(Boolean)
                        .join(', ') || '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
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

export default Classes;
