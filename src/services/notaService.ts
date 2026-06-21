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
  alunoNome?: string;
  alunoMatricula?: string;
  disciplinaNome?: string;
  professorNome?: string;
  turmaLabel?: string;
  semestre?: string;
}

export interface NotaPayload {
  matriculaId: number;
  valor: number;
  tipo: string;
}

function normalizeNota(nota: Nota): Nota {
  return {
    ...nota,
    matriculaId: nota.matriculaId ?? nota.matricula?.id,
    valor: Number(nota.valor ?? nota.nota ?? nota.value ?? 0),
    tipo: nota.tipo || 'Não informado',
    alunoNome: nota.alunoNome || nota.matricula?.alunoNome,
    alunoMatricula: nota.alunoMatricula || nota.matricula?.alunoMatricula,
    disciplinaNome: nota.disciplinaNome || nota.matricula?.disciplinaNome,
    professorNome: nota.professorNome || nota.matricula?.professorNome,
    turmaLabel: nota.turmaLabel || nota.matricula?.turmaLabel,
    semestre: nota.semestre || nota.matricula?.semestre,
  };
}

export async function listarNotas() {
  const response = await api.get('/notas');
  return extractList<Nota>(response.data).map(normalizeNota);
}

export async function criarNota(payload: NotaPayload) {
  const response = await api.post<Nota>('/notas', {
    matriculaId: Number(payload.matriculaId),
    valor: Number(payload.valor),
    tipo: payload.tipo,
  });
  return normalizeNota(response.data);
}

export async function atualizarNota(id: number, payload: NotaPayload) {
  // PENDÊNCIA BACKEND: não existe PUT /notas/{id}.
  const response = await api.put<Nota>(`/notas/${id}`, {
    matriculaId: Number(payload.matriculaId),
    valor: Number(payload.valor),
    tipo: payload.tipo,
  });
  return normalizeNota(response.data);
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
