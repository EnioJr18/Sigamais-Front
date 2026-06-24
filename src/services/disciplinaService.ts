import { api } from './api';
import { extractList } from './http';

export interface Disciplina {
  id: number;
  nome?: string;
  cargaHoraria?: number;
  name?: string;
  workload?: number;
}

export interface DisciplinaPayload {
  nome: string;
  cargaHoraria: number;
}

export async function listarDisciplinas() {
  const response = await api.get('/disciplinas');
  return extractList<Disciplina>(response.data);
}

export async function buscarDisciplinaPorId(id: number) {
  // PENDÊNCIA BACKEND: não existe GET /disciplinas/{id}.
  const response = await api.get<Disciplina>(`/disciplinas/${id}`);
  return response.data;
}

export async function criarDisciplina(payload: DisciplinaPayload) {
  const response = await api.post<Disciplina>('/disciplinas', payload);
  return response.data;
}

export async function atualizarDisciplina(
  id: number,
  payload: DisciplinaPayload,
) {
  const response = await api.put<Disciplina>(`/disciplinas/${id}`, payload);
  return response.data;
}

export async function excluirDisciplina(id: number) {
  await api.delete(`/disciplinas/${id}`);
}

export function getDisciplinaName(disciplina: Disciplina) {
  return disciplina.nome || disciplina.name || 'Disciplina sem nome';
}

export function getDisciplinaWorkload(disciplina: Disciplina) {
  return disciplina.cargaHoraria ?? disciplina.workload ?? 0;
}
