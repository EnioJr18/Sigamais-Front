import {
  getAlunoName,
  getAlunoRegistration,
  type Aluno,
} from '../services/alunoService';
import {
  getMatriculaAlunoId,
  getMatriculaTurmaId,
  type Matricula,
} from '../services/matriculaService';
import { getTurmaName, type Turma } from '../services/turmaService';

export function resolveAluno(matricula: Matricula, alunos: Aluno[]) {
  return alunos.find(aluno => aluno.id === getMatriculaAlunoId(matricula));
}

export function resolveTurma(matricula: Matricula, turmas: Turma[]) {
  return turmas.find(turma => turma.id === getMatriculaTurmaId(matricula));
}

export function getMatriculaContext(
  matricula: Matricula,
  alunos: Aluno[],
  turmas: Turma[],
) {
  const aluno = resolveAluno(matricula, alunos);
  const turma = resolveTurma(matricula, turmas);
  const alunoId = getMatriculaAlunoId(matricula);
  const turmaId = getMatriculaTurmaId(matricula);
  const alunoNome = matricula.alunoNome || (aluno ? getAlunoName(aluno) : '');
  const alunoMatricula =
    matricula.alunoMatricula || (aluno ? getAlunoRegistration(aluno) : '');
  const semestre = matricula.semestre || turma?.semestre || '';
  const ano = matricula.ano ?? turma?.ano;
  const disciplinaNome = matricula.disciplinaNome || turma?.disciplinaNome || '';
  const professorNome = matricula.professorNome || turma?.professorNome || '';

  return {
    alunoLabel: alunoNome || (alunoId
        ? `Aluno #${alunoId}`
        : 'Aluno não informado'),
    alunoMatricula: alunoMatricula || (alunoId ? `#${alunoId}` : 'Não informada'),
    turmaLabel:
      matricula.turmaLabel ||
      (turma ? getTurmaName(turma) : '') ||
      (turmaId
        ? `Turma #${turmaId}`
        : 'Turma não informada'),
    disciplinaNome: disciplinaNome || 'Disciplina não informada',
    professorNome: professorNome || 'Professor não informado',
    semestre: semestre || 'Semestre não informado',
    ano,
  };
}

export function buildEnrollmentLabel(
  matricula: Matricula,
  alunos: Aluno[] = [],
  turmas: Turma[] = [],
) {
  const context = getMatriculaContext(matricula, alunos, turmas);
  const parts = [context.alunoLabel];

  if (context.alunoMatricula && context.alunoMatricula !== 'Não informada') {
    parts.push(`Matrícula ${context.alunoMatricula}`);
  }
  if (context.disciplinaNome !== 'Disciplina não informada') {
    parts.push(context.disciplinaNome);
  }
  parts.push(context.semestre);

  return parts.join(' - ');
}
