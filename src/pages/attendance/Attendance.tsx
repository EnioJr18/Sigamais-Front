import type { FormEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { motion } from 'framer-motion';
import { ClipboardCheck, Plus, Search } from 'lucide-react';

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
  attendance as seedAttendance,
  classes,
  disciplines,
  findClassGroup,
  findDiscipline,
  findProfessor,
  findStudent,
  formatDate,
  nextId,
  professors,
  statusTone,
  students,
  type AttendanceRecord,
} from '@/lib/school-data';

type AttendanceForm = Omit<AttendanceRecord, 'id'>;

const emptyForm: AttendanceForm = {
  studentId: students[0]?.id ?? 1,
  classId: classes[0]?.id ?? 1,
  disciplineId: disciplines[0]?.id ?? 1,
  professorId: professors[0]?.id ?? 1,
  date: '2025-03-17',
  presence: 'Presente',
  observation: '',
};

function Attendance() {
  const [items, setItems] = useState(seedAttendance);
  const [search, setSearch] = useState('');
  const [presenceFilter, setPresenceFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(
    () =>
      items.filter(item => {
        const student = findStudent(item.studentId);
        const classGroup = findClassGroup(item.classId);
        const discipline = findDiscipline(item.disciplineId);
        const professor = findProfessor(item.professorId);

        const haystack = [
          student?.name,
          classGroup?.name,
          discipline?.name,
          professor?.name,
          item.date,
          item.presence,
          item.observation,
        ]
          .join(' ')
          .toLowerCase();

        return (
          haystack.includes(search.toLowerCase()) &&
          (presenceFilter === 'all' || item.presence === presenceFilter) &&
          (classFilter === 'all' || String(item.classId) === classFilter)
        );
      }),
    [items, search, presenceFilter, classFilter],
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
            <ClipboardCheck className="h-5 w-5" />
            <CardTitle>Frequência</CardTitle>
          </div>
          <CardDescription>
            Cadastro e consulta com filtros por turma e presença.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Aluno">
                <Select
                  value={String(form.studentId)}
                  onChange={event =>
                    setForm({ ...form, studentId: Number(event.target.value) })
                  }
                >
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </Select>
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
              <Field label="Disciplina">
                <Select
                  value={String(form.disciplineId)}
                  onChange={event =>
                    setForm({
                      ...form,
                      disciplineId: Number(event.target.value),
                    })
                  }
                >
                  {disciplines.map(discipline => (
                    <option key={discipline.id} value={discipline.id}>
                      {discipline.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Professor">
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
              <Field label="Data">
                <Input
                  type="date"
                  value={form.date}
                  onChange={event =>
                    setForm({ ...form, date: event.target.value })
                  }
                />
              </Field>
              <Field label="Presença">
                <Select
                  value={form.presence}
                  onChange={event =>
                    setForm({
                      ...form,
                      presence: event.target
                        .value as AttendanceRecord['presence'],
                    })
                  }
                >
                  <option value="Presente">Presente</option>
                  <option value="Falta">Falta</option>
                  <option value="Justificada">Justificada</option>
                </Select>
              </Field>
              <Field label="Observação">
                <Input
                  value={form.observation}
                  onChange={event =>
                    setForm({ ...form, observation: event.target.value })
                  }
                  placeholder="Comentário opcional"
                />
              </Field>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Badge variant="soft">
                A frequência também respeita os mesmos vínculos das notas
              </Badge>
              <Button type="submit">
                <Plus className="h-4 w-4" />
                Registrar
              </Button>
            </div>
          </form>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <Field label="Busca geral">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-9"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Buscar aluno, turma, disciplina, professor ou data"
                />
              </div>
            </Field>
            <Field label="Turma">
              <Select
                value={classFilter}
                onChange={event => setClassFilter(event.target.value)}
              >
                <option value="all">Todas</option>
                {classes.map(classGroup => (
                  <option key={classGroup.id} value={classGroup.id}>
                    {classGroup.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Presença">
              <Select
                value={presenceFilter}
                onChange={event => setPresenceFilter(event.target.value)}
              >
                <option value="all">Todas</option>
                <option value="Presente">Presente</option>
                <option value="Falta">Falta</option>
                <option value="Justificada">Justificada</option>
              </Select>
            </Field>
            <MiniStat label="Registros" value={items.length} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listagem</CardTitle>
          <CardDescription>
            Presença por aluno com contexto de turma, disciplina e professor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Aluno</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Presença</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell>
                    {findStudent(item.studentId)?.name ?? '-'}
                  </TableCell>
                  <TableCell>
                    {findClassGroup(item.classId)?.name ?? '-'}
                  </TableCell>
                  <TableCell>
                    {findDiscipline(item.disciplineId)?.name ?? '-'}
                  </TableCell>
                  <TableCell>
                    {findProfessor(item.professorId)?.name ?? '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusTone[item.presence]}>
                      {item.presence}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.observation}</TableCell>
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

export default Attendance;
