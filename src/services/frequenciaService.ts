import { api } from './api';
import { extractList } from './http';
import type { Matricula } from './matriculaService';

export interface Frequencia {
  id: number;
  matriculaId?: number;
  matricula?: Matricula;
  faltas?: number;
  absences?: number;
  alunoNome?: string;
  alunoMatricula?: string;
  disciplinaNome?: string;
  professorNome?: string;
  turmaLabel?: string;
  semestre?: string;
}

export interface FrequenciaPayload {
  matriculaId: number;
  faltas: number;
}

export interface FrequenciaResumo {
  matriculaId: number;
  alunoNome: string;
  alunoMatricula: string;
  disciplinaNome: string;
  professorNome: string;
  semestre: string;
  totalFaltas: number;
  quantidadeRegistros: number;
}

function normalizeFrequencia(frequencia: Frequencia): Frequencia {
  return {
    ...frequencia,
    matriculaId: frequencia.matriculaId ?? frequencia.matricula?.id,
    faltas: Number(frequencia.faltas ?? frequencia.absences ?? 0),
    alunoNome: frequencia.alunoNome || frequencia.matricula?.alunoNome,
    alunoMatricula:
      frequencia.alunoMatricula || frequencia.matricula?.alunoMatricula,
    disciplinaNome:
      frequencia.disciplinaNome || frequencia.matricula?.disciplinaNome,
    professorNome:
      frequencia.professorNome || frequencia.matricula?.professorNome,
    turmaLabel: frequencia.turmaLabel || frequencia.matricula?.turmaLabel,
    semestre: frequencia.semestre || frequencia.matricula?.semestre,
  };
}

export async function listarFrequencias() {
  const response = await api.get('/frequencias');
  return extractList<Frequencia>(response.data).map(normalizeFrequencia);
}

export async function buscarResumoFrequencias() {
  const response = await api.get('/frequencias/resumo');
  return extractList<FrequenciaResumo>(response.data).map(item => ({
    ...item,
    matriculaId: Number(item.matriculaId),
    totalFaltas: Number(item.totalFaltas),
    quantidadeRegistros: Number(item.quantidadeRegistros),
  }));
}

export async function buscarResumoFrequenciasProfessor() {
  const response = await api.get('/usuarios/me/professor/frequencias');
  return extractList<FrequenciaResumo>(response.data).map(item => ({
    ...item,
    matriculaId: Number(item.matriculaId),
    totalFaltas: Number(item.totalFaltas),
    quantidadeRegistros: Number(item.quantidadeRegistros),
  }));
}

export async function criarFrequencia(payload: FrequenciaPayload) {
  const response = await api.post<Frequencia>('/frequencias', {
    matriculaId: Number(payload.matriculaId),
    faltas: Number(payload.faltas),
  });
  return normalizeFrequencia(response.data);
}

export async function atualizarFrequencia(
  id: number,
  payload: FrequenciaPayload,
) {
  // PENDÊNCIA BACKEND: não existe PUT /frequencias/{id}.
  const response = await api.put<Frequencia>(`/frequencias/${id}`, {
    matriculaId: Number(payload.matriculaId),
    faltas: Number(payload.faltas),
  });
  return normalizeFrequencia(response.data);
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
