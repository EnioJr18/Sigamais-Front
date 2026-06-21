import { api } from './api';
import { extractList } from './http';

export interface Professor {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  titulacao: string;
}

interface ProfessorApiResponse {
  id: number;
  nome?: string;
  cpf?: string;
  email?: string;
  titulacao?: string;
  usuario?: {
    id?: number;
    nome?: string;
    cpf?: string;
    email?: string;
  };
}

export interface ProfessorPayload {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  titulacao: string;
}

export interface ProfessorUpdatePayload {
  titulacao: string;
}

function normalizeProfessor(professor: ProfessorApiResponse): Professor {
  return {
    id: professor.id,
    nome: professor.nome || professor.usuario?.nome || `Professor #${professor.id}`,
    cpf: professor.cpf || professor.usuario?.cpf || '',
    email: professor.email || professor.usuario?.email || '',
    titulacao: professor.titulacao || '',
  };
}

export async function listarProfessores() {
  const response = await api.get('/professores');
  return extractList<ProfessorApiResponse>(response.data).map(normalizeProfessor);
}

export async function buscarProfessorPorId(id: number) {
  // PENDÊNCIA BACKEND: não existe GET /professores/{id}.
  const response = await api.get<ProfessorApiResponse>(`/professores/${id}`);
  return normalizeProfessor(response.data);
}

export async function criarProfessor(payload: ProfessorPayload) {
  const response = await api.post<ProfessorApiResponse>('/professores', payload);
  return normalizeProfessor(response.data);
}

export async function atualizarProfessor(
  id: number,
  payload: ProfessorUpdatePayload,
) {
  // PENDÊNCIA BACKEND: não existe PUT /professores/{id}.
  const response = await api.put<ProfessorApiResponse>(`/professores/${id}`, payload);
  return normalizeProfessor(response.data);
}

export async function excluirProfessor(id: number) {
  // PENDÊNCIA BACKEND: não existe DELETE /professores/{id}.
  await api.delete(`/professores/${id}`);
}

export function getProfessorName(professor: Professor) {
  return professor.nome;
}

export function getProfessorSpecialty(professor: Professor) {
  return professor.titulacao || '';
}

export function getProfessorPhone(_professor: Professor) {
  void _professor;
  return '';
}
