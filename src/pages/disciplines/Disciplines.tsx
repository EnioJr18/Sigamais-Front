import type { FormEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { motion } from 'framer-motion';
import { BookMarked, Plus, Search } from 'lucide-react';

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
  disciplines as seedDisciplines,
  findProfessor,
  nextId,
  professors,
  type Discipline,
} from '@/lib/school-data';

type DisciplineForm = Omit<Discipline, 'id' | 'professorId'> & {
  professorId: string;
};

const emptyForm: DisciplineForm = {
  name: '',
  workload: 60,
  professorId: String(professors[0]?.id ?? ''),
};

function Disciplines() {
  const [items, setItems] = useState(seedDisciplines);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(
    () =>
      items.filter(item => {
        const professor = findProfessor(item.professorId);
        const haystack = [item.name, String(item.workload), professor?.name]
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
        workload: Number(form.workload),
        professorId: Number(form.professorId),
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
            <BookMarked className="h-5 w-5" />
            <CardTitle>Disciplinas</CardTitle>
          </div>
          <CardDescription>
            Cadastro de componentes curriculares e seus responsáveis.
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
                  placeholder="Ex.: Matemática"
                />
              </Field>
              <Field label="Carga horária">
                <Input
                  type="number"
                  value={form.workload}
                  onChange={event =>
                    setForm({ ...form, workload: Number(event.target.value) })
                  }
                />
              </Field>
              <Field label="Professor responsável">
                <Select
                  value={form.professorId}
                  onChange={event =>
                    setForm({ ...form, professorId: event.target.value })
                  }
                >
                  {professors.map(professor => (
                    <option key={professor.id} value={professor.id}>
                      {professor.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Badge variant="soft">
                As notas e frequência usam essas relações como filtro
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
                  placeholder="Buscar por nome, carga horária ou professor"
                />
              </div>
            </Field>
            <MiniStat label="Disciplinas" value={items.length} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listagem</CardTitle>
          <CardDescription>
            Disciplinas com professor responsável.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Carga horária</TableHead>
                <TableHead>Professor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.workload}h</TableCell>
                  <TableCell>
                    {findProfessor(item.professorId)?.name ?? '-'}
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

export default Disciplines;
