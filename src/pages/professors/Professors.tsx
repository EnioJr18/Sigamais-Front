import type { ReactNode, FormEvent } from 'react';
import { useMemo, useState } from 'react';

import { motion } from 'framer-motion';
import { BookOpen, Plus, Search } from 'lucide-react';

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
  disciplines,
  nextId,
  professors as seedProfessors,
  type Professor,
} from '@/lib/school-data';

type ProfessorForm = Omit<Professor, 'id'>;

const emptyForm: ProfessorForm = {
  name: '',
  email: '',
  specialty: '',
  phone: '',
};

function Professors() {
  const [items, setItems] = useState(seedProfessors);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(
    () =>
      items.filter(item => {
        const haystack = [item.name, item.email, item.specialty, item.phone]
          .join(' ')
          .toLowerCase();

        return haystack.includes(search.toLowerCase());
      }),
    [items, search],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setItems(current => [...current, { id: nextId(current), ...form }]);
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
            <BookOpen className="h-5 w-5" />
            <CardTitle>Professores</CardTitle>
          </div>
          <CardDescription>
            Cadastro, relação com disciplinas e visualização dos vínculos com
            turmas.
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
                  placeholder="Nome do professor"
                />
              </Field>
              <Field label="Especialidade">
                <Input
                  value={form.specialty}
                  onChange={event =>
                    setForm({ ...form, specialty: event.target.value })
                  }
                  placeholder="Ex.: Matemática"
                />
              </Field>
              <Field label="Email">
                <Input
                  value={form.email}
                  onChange={event =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="professor@ifal.edu.br"
                />
              </Field>
              <Field label="Telefone">
                <Input
                  value={form.phone}
                  onChange={event =>
                    setForm({ ...form, phone: event.target.value })
                  }
                  placeholder="(82) 99999-0000"
                />
              </Field>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Badge variant="soft">
                Relações exibidas na listagem de disciplinas e turmas
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
                  placeholder="Buscar por nome, email ou especialidade"
                />
              </div>
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat label="Professores" value={items.length} />
              <MiniStat label="Disciplinas" value={disciplines.length} />
              <MiniStat label="Turmas" value={classes.length} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listagem</CardTitle>
          <CardDescription>
            Registros filtrados pelo campo de busca.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Turmas</TableHead>
                <TableHead>Disciplinas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.specialty}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    {classes
                      .filter(classGroup => classGroup.professorId === item.id)
                      .map(classGroup => classGroup.name)
                      .join(', ') || 'Sem turma vinculada'}
                  </TableCell>
                  <TableCell>
                    {disciplines
                      .filter(discipline => discipline.professorId === item.id)
                      .map(discipline => discipline.name)
                      .join(', ') || 'Sem disciplina vinculada'}
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

export default Professors;
