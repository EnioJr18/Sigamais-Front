import { api } from './api';
import { extractList } from './http';
import type { Matricula } from './matriculaService';

export interface Nota {
  id: number;
  matriculaId?: number;
  matricula?: Matricula;
  valor?: number;
  nota?: number;
  value?: number;
  tipo?: string;
}

export interface NotaPayload {
  matriculaId: number;
  valor: number;
  tipo: string;
}

export async function listarNotas() {
  // PENDÊNCIA BACKEND: não existe GET /notas; apenas GET /notas/matriculas/{id}.
  const response = await api.get('/notas');
  return extractList<Nota>(response.data);
}

export async function criarNota(payload: NotaPayload) {
  const response = await api.post<Nota>('/notas', payload);
  return response.data;
}

export async function atualizarNota(id: number, payload: NotaPayload) {
  // PENDÊNCIA BACKEND: não existe PUT /notas/{id}.
  const response = await api.put<Nota>(`/notas/${id}`, payload);
  return response.data;
}

export async function excluirNota(id: number) {
  // PENDÊNCIA BACKEND: não existe DELETE /notas/{id}.
  await api.delete(`/notas/${id}`);
}

export function getNotaMatriculaId(nota: Nota) {
  return nota.matriculaId ?? nota.matricula?.id;
}

export function getNotaValue(nota: Nota) {
  return nota.valor ?? nota.nota ?? nota.value ?? 0;
}
