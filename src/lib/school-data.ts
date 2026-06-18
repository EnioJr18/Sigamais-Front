export type Professor = {
  id: number;
  name: string;
  email: string;
  specialty: string;
  phone: string;
};

export type Discipline = {
  id: number;
  name: string;
  workload: number;
  professorId: number;
};

export type ClassGroup = {
  id: number;
  name: string;
  year: string;
  shift: string;
  room: string;
  professorId: number;
  disciplineIds: number[];
};

export type Student = {
  id: number;
  name: string;
  registration: string;
  classId: number;
  guardian: string;
  status: 'Ativo' | 'Pendente' | 'Transferido';
};

export type GradeRecord = {
  id: number;
  studentId: number;
  classId: number;
  disciplineId: number;
  professorId: number;
  period: string;
  value: number;
  maxValue: number;
  observation: string;
};

export type AttendanceRecord = {
  id: number;
  studentId: number;
  classId: number;
  disciplineId: number;
  professorId: number;
  date: string;
  presence: 'Presente' | 'Falta' | 'Justificada';
  observation: string;
};

export const professors: Professor[] = [
  {
    id: 1,
    name: 'Marina Oliveira',
    email: 'marina.oliveira@ifal.edu.br',
    specialty: 'Matemática',
    phone: '(82) 99999-1001',
  },
  {
    id: 2,
    name: 'Carlos Menezes',
    email: 'carlos.menezes@ifal.edu.br',
    specialty: 'Linguagens',
    phone: '(82) 99999-1002',
  },
  {
    id: 3,
    name: 'Aline Pereira',
    email: 'aline.pereira@ifal.edu.br',
    specialty: 'Ciências Humanas',
    phone: '(82) 99999-1003',
  },
  {
    id: 4,
    name: 'Rogério Santos',
    email: 'rogerio.santos@ifal.edu.br',
    specialty: 'Programação',
    phone: '(82) 99999-1004',
  },
];

export const disciplines: Discipline[] = [
  { id: 1, name: 'Matemática', workload: 80, professorId: 1 },
  { id: 2, name: 'Português', workload: 72, professorId: 2 },
  { id: 3, name: 'História', workload: 64, professorId: 3 },
  { id: 4, name: 'Programação Web', workload: 96, professorId: 4 },
];

export const classes: ClassGroup[] = [
  {
    id: 1,
    name: '1A',
    year: '2025',
    shift: 'Matutino',
    room: 'Sala 101',
    professorId: 1,
    disciplineIds: [1, 2, 3],
  },
  {
    id: 2,
    name: '2B',
    year: '2025',
    shift: 'Vespertino',
    room: 'Sala 203',
    professorId: 2,
    disciplineIds: [2, 3, 4],
  },
  {
    id: 3,
    name: '3C',
    year: '2025',
    shift: 'Noturno',
    room: 'Laboratório 2',
    professorId: 4,
    disciplineIds: [1, 4],
  },
];

export const students: Student[] = [
  {
    id: 1,
    name: 'Ana Beatriz Lima',
    registration: '2025A001',
    classId: 1,
    guardian: 'Sílvia Lima',
    status: 'Ativo',
  },
  {
    id: 2,
    name: 'Bruno Ferreira',
    registration: '2025A002',
    classId: 1,
    guardian: 'Paulo Ferreira',
    status: 'Ativo',
  },
  {
    id: 3,
    name: 'Carla Mendes',
    registration: '2025B003',
    classId: 2,
    guardian: 'Patrícia Mendes',
    status: 'Pendente',
  },
  {
    id: 4,
    name: 'Diego Alves',
    registration: '2025B004',
    classId: 2,
    guardian: 'Nádia Alves',
    status: 'Ativo',
  },
  {
    id: 5,
    name: 'Ester Rocha',
    registration: '2025C005',
    classId: 3,
    guardian: 'Renato Rocha',
    status: 'Transferido',
  },
  {
    id: 6,
    name: 'Felipe Costa',
    registration: '2025C006',
    classId: 3,
    guardian: 'Marta Costa',
    status: 'Ativo',
  },
];

export const grades: GradeRecord[] = [
  {
    id: 1,
    studentId: 1,
    classId: 1,
    disciplineId: 1,
    professorId: 1,
    period: '1º bimestre',
    value: 8.4,
    maxValue: 10,
    observation: 'Boa evolução',
  },
  {
    id: 2,
    studentId: 2,
    classId: 1,
    disciplineId: 2,
    professorId: 2,
    period: '1º bimestre',
    value: 7.1,
    maxValue: 10,
    observation: 'Precisa reforçar interpretação',
  },
  {
    id: 3,
    studentId: 3,
    classId: 2,
    disciplineId: 3,
    professorId: 3,
    period: '2º bimestre',
    value: 6.2,
    maxValue: 10,
    observation: 'Recuperação recomendada',
  },
  {
    id: 4,
    studentId: 6,
    classId: 3,
    disciplineId: 4,
    professorId: 4,
    period: '2º bimestre',
    value: 9.4,
    maxValue: 10,
    observation: 'Ótimo desempenho',
  },
];

export const attendance: AttendanceRecord[] = [
  {
    id: 1,
    studentId: 1,
    classId: 1,
    disciplineId: 1,
    professorId: 1,
    date: '2025-03-14',
    presence: 'Presente',
    observation: 'Pontual',
  },
  {
    id: 2,
    studentId: 2,
    classId: 1,
    disciplineId: 2,
    professorId: 2,
    date: '2025-03-14',
    presence: 'Falta',
    observation: 'Sem justificativa',
  },
  {
    id: 3,
    studentId: 4,
    classId: 2,
    disciplineId: 3,
    professorId: 3,
    date: '2025-03-15',
    presence: 'Justificada',
    observation: 'Atestado entregue',
  },
  {
    id: 4,
    studentId: 6,
    classId: 3,
    disciplineId: 4,
    professorId: 4,
    date: '2025-03-16',
    presence: 'Presente',
    observation: 'Participativo',
  },
];

export const statusTone = {
  Ativo: 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30',
  Pendente: 'bg-amber-500/15 text-amber-200 ring-amber-500/30',
  Transferido: 'bg-slate-500/15 text-slate-200 ring-slate-500/30',
  Presente: 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30',
  Falta: 'bg-red-500/15 text-red-200 ring-red-500/30',
  Justificada: 'bg-blue-500/15 text-blue-200 ring-blue-500/30',
} as const;

export const gradeResultTone = (value: number) => {
  if (value >= 7) {
    return 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30';
  }

  if (value >= 5) {
    return 'bg-amber-500/15 text-amber-200 ring-amber-500/30';
  }

  return 'bg-red-500/15 text-red-200 ring-red-500/30';
};

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`));

export const formatDecimal = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);

export const findProfessor = (id: number) =>
  professors.find(professor => professor.id === id);

export const findDiscipline = (id: number) =>
  disciplines.find(discipline => discipline.id === id);

export const findClassGroup = (id: number) =>
  classes.find(classGroup => classGroup.id === id);

export const findStudent = (id: number) =>
  students.find(student => student.id === id);

export const nextId = (items: Array<{ id: number }>) =>
  items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
