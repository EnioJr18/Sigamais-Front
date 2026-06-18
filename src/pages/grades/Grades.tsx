import type { FormEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { motion } from 'framer-motion';
import { Calculator, Filter, Plus } from 'lucide-react';

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
  disciplines,
  findClassGroup,
  findDiscipline,
  findProfessor,
  findStudent,
  formatDecimal,
  grades as seedGrades,
  gradeResultTone,
  nextId,
  professors,
  students,
  type GradeRecord,
} from '@/lib/school-data';

type GradeForm = Omit<GradeRecord, 'id'>;

const emptyForm: GradeForm = {
  studentId: students[0]?.id ?? 1,
  classId: classes[0]?.id ?? 1,
  disciplineId: disciplines[0]?.id ?? 1,
  professorId: professors[0]?.id ?? 1,
  period: '1º bimestre',
  value: 0,
  maxValue: 10,
  observation: '',
};

function Grades() {
  const [items, setItems] = useState(seedGrades);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [disciplineFilter, setDisciplineFilter] = useState('all');
  const [professorFilter, setProfessorFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');
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
          item.period,
          String(item.value),
          item.observation,
        ]
          .join(' ')
          .toLowerCase();

        return (
          haystack.includes(search.toLowerCase()) &&
          (classFilter === 'all' || String(item.classId) === classFilter) &&
          (disciplineFilter === 'all' ||
            String(item.disciplineId) === disciplineFilter) &&
          (professorFilter === 'all' ||
            String(item.professorId) === professorFilter) &&
          (studentFilter === 'all' || String(item.studentId) === studentFilter)
        );
      }),
    [
      items,
      search,
      classFilter,
      disciplineFilter,
      professorFilter,
      studentFilter,
    ],
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
            <Calculator className="h-5 w-5" />
            <CardTitle>Notas</CardTitle>
          </div>
          <CardDescription>
            Lançamento com filtros por aluno, turma, disciplina e professor para
            refletir os relacionamentos.
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
              <Field label="Período">
                <Input
                  value={form.period}
                  onChange={event =>
                    setForm({ ...form, period: event.target.value })
                  }
                  placeholder="1º bimestre"
                />
              </Field>
              <Field label="Nota">
                <Input
                  type="number"
                  step="0.1"
                  value={form.value}
                  onChange={event =>
                    setForm({ ...form, value: Number(event.target.value) })
                  }
                />
              </Field>
              <Field label="Máximo">
                <Input
                  type="number"
                  step="0.1"
                  value={form.maxValue}
                  onChange={event =>
                    setForm({ ...form, maxValue: Number(event.target.value) })
                  }
                />
              </Field>
              <Field label="Observação">
                <Input
                  value={form.observation}
                  onChange={event =>
                    setForm({ ...form, observation: event.target.value })
                  }
                  placeholder="Comentário sobre o desempenho"
                />
              </Field>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Badge variant="soft">
                A listagem pode ser filtrada por qualquer relacionamento
              </Badge>
              <Button type="submit">
                <Plus className="h-4 w-4" />
                Lançar nota
              </Button>
            </div>
          </form>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <Field label="Busca geral">
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-9"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Buscar aluno, turma, disciplina ou professor"
                />
              </div>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
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
              <Field label="Disciplina">
                <Select
                  value={disciplineFilter}
                  onChange={event => setDisciplineFilter(event.target.value)}
                >
                  <option value="all">Todas</option>
                  {disciplines.map(discipline => (
                    <option key={discipline.id} value={discipline.id}>
                      {discipline.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Professor">
                <Select
                  value={professorFilter}
                  onChange={event => setProfessorFilter(event.target.value)}
                >
                  <option value="all">Todos</option>
                  {professors.map(professor => (
                    <option key={professor.id} value={professor.id}>
                      {professor.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Aluno">
                <Select
                  value={studentFilter}
                  onChange={event => setStudentFilter(event.target.value)}
                >
                  <option value="all">Todos</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <MiniStat label="Notas exibidas" value={filtered.length} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listagem</CardTitle>
          <CardDescription>
            Notas com contexto completo do relacionamento acadêmico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => {
                const student = findStudent(item.studentId);
                const classGroup = findClassGroup(item.classId);
                const discipline = findDiscipline(item.disciplineId);
                const professor = findProfessor(item.professorId);

                return (
                  <TableRow key={item.id}>
                    <TableCell>{student?.name ?? '-'}</TableCell>
                    <TableCell>{classGroup?.name ?? '-'}</TableCell>
                    <TableCell>{discipline?.name ?? '-'}</TableCell>
                    <TableCell>{professor?.name ?? '-'}</TableCell>
                    <TableCell>
                      <Badge className={gradeResultTone(item.value)}>
                        {formatDecimal(item.value)} /{' '}
                        {formatDecimal(item.maxValue)}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.period}</TableCell>
                    <TableCell>{item.observation}</TableCell>
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

export default Grades;
