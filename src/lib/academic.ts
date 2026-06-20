import { getAlunoName, type Aluno } from '../services/alunoService';
import {
  getMatriculaAlunoId,
  getMatriculaTurmaId,
  type Matricula,
} from '../services/matriculaService';
import { getTurmaName, type Turma } from '../services/turmaService';

export function resolveAluno(matricula: Matricula, alunos: Aluno[]) {
  return (
    matricula.aluno ??
    alunos.find(aluno => aluno.id === getMatriculaAlunoId(matricula))
  );
}

export function resolveTurma(matricula: Matricula, turmas: Turma[]) {
  return (
    matricula.turma ??
    turmas.find(turma => turma.id === getMatriculaTurmaId(matricula))
  );
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

  return {
    alunoLabel: aluno
      ? getAlunoName(aluno)
      : matricula.matriculaAluno
        ? `Matrícula ${matricula.matriculaAluno}`
      : alunoId
        ? `Aluno #${alunoId}`
        : 'Aluno não informado',
    turmaLabel: turma
      ? getTurmaName(turma)
      : matricula.nomeDisciplina
        ? matricula.nomeDisciplina
      : turmaId
        ? `Turma #${turmaId}`
        : 'Turma não informada',
  };
}
