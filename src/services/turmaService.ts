import type { Disciplina } from './disciplinaService';
import { api } from './api';
import { extractList } from './http';
import type { Professor } from './professorService';

export interface Turma {
  id: number;
  nome?: string;
  semestre?: string;
  ano?: string | number;
  turno?: string;
  sala?: string;
  vagas?: number;
  professorId?: number;
  disciplinaId?: number;
  professor?: Professor;
  disciplina?: Disciplina;
  name?: string;
  year?: string | number;
  shift?: string;
  room?: string;
}

export interface TurmaPayload {
  professorId: number;
  disciplinaId: number;
  semestre: string;
  ano: number;
}

export async function listarTurmas() {
  // PENDÊNCIA BACKEND: não existe GET /api/turmas.
  const response = await api.get('/api/turmas');
  return extractList<Turma>(response.data);
}

export async function buscarTurmaPorId(id: number) {
  // PENDÊNCIA BACKEND: não existe GET /api/turmas/{id}.
  const response = await api.get<Turma>(`/api/turmas/${id}`);
  return response.data;
}

export async function criarTurma(payload: TurmaPayload) {
  // PENDÊNCIA BACKEND: o endpoint não recebe vagas, mas a matrícula exige
  // turma.vagas preenchido para validar a capacidade.
  const response = await api.post<Turma>('/api/turmas', undefined, {
    params: payload,
  });
  return response.data;
}

export async function atualizarTurma(id: number, payload: TurmaPayload) {
  // PENDÊNCIA BACKEND: não existe PUT /api/turmas/{id}.
  const response = await api.put<Turma>(`/api/turmas/${id}`, payload);
  return response.data;
}

export async function excluirTurma(id: number) {
  // PENDÊNCIA BACKEND: não existe DELETE /api/turmas/{id}.
  await api.delete(`/api/turmas/${id}`);
}

export function getTurmaName(turma: Turma) {
  return turma.nome || turma.name || turma.semestre || `Turma #${turma.id}`;
}

export function getTurmaYear(turma: Turma) {
  return turma.ano ?? turma.year ?? '';
}

export function getTurmaShift(turma: Turma) {
  return turma.turno || turma.shift || '';
}

export function getTurmaRoom(turma: Turma) {
  return turma.sala || turma.room || '';
}
