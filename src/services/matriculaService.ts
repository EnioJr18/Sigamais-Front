import { api } from './api';
import { extractList } from './http';

export interface Matricula {
  id: number;
  alunoId?: number;
  alunoNome: string;
  alunoMatricula: string;
  turmaId?: number;
  turmaLabel: string;
  disciplinaNome: string;
  professorNome: string;
  semestre: string;
  ano?: number;
  status?: string;
}

interface MatriculaApiResponse {
  id: number;
  alunoId?: number;
  turmaId?: number;
  studentId?: number;
  classId?: number;
  alunoNome?: string;
  alunoMatricula?: string;
  matriculaAluno?: string;
  turmaLabel?: string;
  disciplinaNome?: string;
  nomeDisciplina?: string;
  professorNome?: string;
  semestre?: string;
  ano?: string | number;
  status?: string;
  aluno?: {
    id?: number;
    nome?: string;
    matricula?: string;
    usuario?: { nome?: string; email?: string };
  };
  turma?: {
    id?: number;
    semestre?: string;
    ano?: string | number;
    disciplina?: { nome?: string };
    professor?: { nome?: string; usuario?: { nome?: string } };
  };
}

export interface MatriculaPayload {
  alunoId: number;
  turmaId: number;
}

function normalizeMatricula(matricula: MatriculaApiResponse): Matricula {
  const alunoId = matricula.alunoId ?? matricula.studentId ?? matricula.aluno?.id;
  const turmaId = matricula.turmaId ?? matricula.classId ?? matricula.turma?.id;
  const semestre = matricula.semestre || matricula.turma?.semestre || '';

  return {
    id: matricula.id,
    alunoId,
    alunoNome:
      matricula.alunoNome ||
      matricula.aluno?.nome ||
      matricula.aluno?.usuario?.nome ||
      '',
    alunoMatricula:
      matricula.alunoMatricula ||
      matricula.matriculaAluno ||
      matricula.aluno?.matricula ||
      '',
    turmaId,
    turmaLabel:
      matricula.turmaLabel ||
      semestre ||
      (turmaId ? `Turma #${turmaId}` : ''),
    disciplinaNome:
      matricula.disciplinaNome ||
      matricula.nomeDisciplina ||
      matricula.turma?.disciplina?.nome ||
      '',
    professorNome:
      matricula.professorNome ||
      matricula.turma?.professor?.nome ||
      matricula.turma?.professor?.usuario?.nome ||
      '',
    semestre,
    ano:
      matricula.ano === undefined && matricula.turma?.ano === undefined
        ? undefined
        : Number(matricula.ano ?? matricula.turma?.ano),
    status: matricula.status,
  };
}

export async function listarMatriculas() {
  const response = await api.get('/matriculas');
  return extractList<MatriculaApiResponse>(response.data).map(normalizeMatricula);
}

export async function buscarMatriculaPorId(id: number) {
  // PENDÊNCIA BACKEND: não existe GET /matriculas/{id}.
  const response = await api.get<MatriculaApiResponse>(`/matriculas/${id}`);
  return normalizeMatricula(response.data);
}

export async function criarMatricula(payload: MatriculaPayload) {
  const response = await api.post<MatriculaApiResponse>('/matriculas', {
    alunoId: Number(payload.alunoId),
    turmaId: Number(payload.turmaId),
  });
  return normalizeMatricula(response.data);
}

export async function excluirMatricula(id: number) {
  // PENDÊNCIA BACKEND: não existe DELETE /matriculas/{id}.
  await api.delete(`/matriculas/${id}`);
}

export function getMatriculaAlunoId(matricula: Matricula) {
  return matricula.alunoId;
}

export function getMatriculaTurmaId(matricula: Matricula) {
  return matricula.turmaId;
}
