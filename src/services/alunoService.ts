import { api } from './api';
import { extractList } from './http';

export interface Aluno {
  id: number;
  nome: string;
  email?: string;
  matricula?: string;
  status?: string;
  curso?: string;
  name?: string;
  registration?: string;
}

export interface AlunoPayload {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  matricula: string;
  curso: string;
  rendaFamiliar: number;
  anoIngresso: number;
}

export async function listarAlunos() {
  // PENDÊNCIA BACKEND: o AlunoController atual não expõe GET /alunos.
  const response = await api.get('/alunos');
  return extractList<Aluno>(response.data);
}

export async function buscarAlunoPorId(id: number) {
  // PENDÊNCIA BACKEND: não existe GET /alunos/{id}.
  const response = await api.get<Aluno>(`/alunos/${id}`);
  return response.data;
}

export async function criarAluno(payload: AlunoPayload) {
  const response = await api.post<Aluno>('/alunos', payload);
  return response.data;
}

export async function atualizarAluno(id: number, payload: AlunoPayload) {
  // PENDÊNCIA BACKEND: não existe PUT /alunos/{id}.
  const response = await api.put<Aluno>(`/alunos/${id}`, payload);
  return response.data;
}

export async function excluirAluno(id: number) {
  // PENDÊNCIA BACKEND: não existe DELETE /alunos/{id}.
  await api.delete(`/alunos/${id}`);
}

export function getAlunoName(aluno: Aluno) {
  return aluno.nome || aluno.name || 'Aluno sem nome';
}

export function getAlunoRegistration(aluno: Aluno) {
  return aluno.matricula || aluno.registration || '';
}
