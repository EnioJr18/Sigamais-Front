import type { Aluno } from './alunoService';
import { api } from './api';
import { extractList } from './http';
import type { Turma } from './turmaService';

export interface Matricula {
  id: number;
  alunoId?: number;
  turmaId?: number;
  aluno?: Aluno;
  turma?: Turma;
  studentId?: number;
  classId?: number;
  matriculaAluno?: string;
  nomeDisciplina?: string;
  status?: string;
}

export interface MatriculaPayload {
  alunoId: number;
  turmaId: number;
}

export async function listarMatriculas() {
  // PENDÊNCIA BACKEND: o MatriculaController atual não expõe GET /matriculas.
  const response = await api.get('/matriculas');
  return extractList<Matricula>(response.data);
}

export async function buscarMatriculaPorId(id: number) {
  // PENDÊNCIA BACKEND: não existe GET /matriculas/{id}.
  const response = await api.get<Matricula>(`/matriculas/${id}`);
  return response.data;
}

export async function criarMatricula(payload: MatriculaPayload) {
  const response = await api.post<Matricula>('/matriculas', payload);
  return response.data;
}

export async function excluirMatricula(id: number) {
  // PENDÊNCIA BACKEND: não existe DELETE /matriculas/{id}.
  await api.delete(`/matriculas/${id}`);
}

export function getMatriculaAlunoId(matricula: Matricula) {
  return matricula.alunoId ?? matricula.studentId ?? matricula.aluno?.id;
}

export function getMatriculaTurmaId(matricula: Matricula) {
  return matricula.turmaId ?? matricula.classId ?? matricula.turma?.id;
}
