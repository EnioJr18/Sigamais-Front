import { api } from './api';
import { extractList } from './http';

export interface Professor {
  id: number;
  titulacao?: string;
}

export interface ProfessorPayload {
  usuarioId: number;
  titulacao: string;
}

export async function listarProfessores() {
  const response = await api.get('/professores');
  return extractList<Professor>(response.data);
}

export async function buscarProfessorPorId(id: number) {
  // PENDÊNCIA BACKEND: não existe GET /professores/{id}.
  const response = await api.get<Professor>(`/professores/${id}`);
  return response.data;
}

export async function criarProfessor(payload: ProfessorPayload) {
  const response = await api.post<Professor>('/professores', payload);
  return response.data;
}

export async function atualizarProfessor(
  id: number,
  payload: ProfessorPayload,
) {
  // PENDÊNCIA BACKEND: não existe PUT /professores/{id}.
  const response = await api.put<Professor>(`/professores/${id}`, payload);
  return response.data;
}

export async function excluirProfessor(id: number) {
  // PENDÊNCIA BACKEND: não existe DELETE /professores/{id}.
  await api.delete(`/professores/${id}`);
}

export function getProfessorName(professor: Professor) {
  return `Professor #${professor.id}`;
}

export function getProfessorSpecialty(professor: Professor) {
  return professor.titulacao || '';
}

export function getProfessorPhone(_professor: Professor) {
  void _professor;
  return '';
}
