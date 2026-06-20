import { api } from './api';
import { extractList } from './http';
import type { Matricula } from './matriculaService';

export interface Frequencia {
  id: number;
  matriculaId?: number;
  matricula?: Matricula;
  faltas?: number;
  absences?: number;
}

export interface FrequenciaPayload {
  matriculaId: number;
  faltas: number;
}

export async function listarFrequencias() {
  // PENDÊNCIA BACKEND: não existe GET /frequencias; apenas GET /frequencias/matriculas/{id}.
  const response = await api.get('/frequencias');
  return extractList<Frequencia>(response.data);
}

export async function criarFrequencia(payload: FrequenciaPayload) {
  const response = await api.post<Frequencia>('/frequencias', payload);
  return response.data;
}

export async function atualizarFrequencia(
  id: number,
  payload: FrequenciaPayload,
) {
  // PENDÊNCIA BACKEND: não existe PUT /frequencias/{id}.
  const response = await api.put<Frequencia>(`/frequencias/${id}`, payload);
  return response.data;
}

export async function excluirFrequencia(id: number) {
  // PENDÊNCIA BACKEND: não existe DELETE /frequencias/{id}.
  await api.delete(`/frequencias/${id}`);
}

export function getFrequenciaMatriculaId(frequencia: Frequencia) {
  return frequencia.matriculaId ?? frequencia.matricula?.id;
}

export function getPresencas(_frequencia: Frequencia) {
  void _frequencia;
  return 0;
}

export function getFaltas(frequencia: Frequencia) {
  return frequencia.faltas ?? frequencia.absences ?? 0;
}
