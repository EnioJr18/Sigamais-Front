import { api } from './api';
import { extractList } from './http';

export interface Turma {
  id: number;
  professorId?: number;
  professorNome: string;
  disciplinaId?: number;
  disciplinaNome: string;
  semestre: string;
  ano?: number;
  vagas?: number;
}

interface TurmaApiResponse {
  id: number;
  professorId?: number;
  professorNome?: string;
  disciplinaId?: number;
  disciplinaNome?: string;
  semestre?: string;
  ano?: string | number;
  vagas?: string | number;
  professor?: {
    id?: number;
    nome?: string;
    usuario?: { nome?: string };
  };
  disciplina?: { id?: number; nome?: string };
}

export interface TurmaPayload {
  professorId: number;
  disciplinaId: number;
  semestre: string;
  ano: number;
  vagas: number;
}

function normalizeTurma(turma: TurmaApiResponse): Turma {
  return {
    id: turma.id,
    professorId: turma.professorId ?? turma.professor?.id,
    professorNome:
      turma.professorNome ||
      turma.professor?.nome ||
      turma.professor?.usuario?.nome ||
      '',
    disciplinaId: turma.disciplinaId ?? turma.disciplina?.id,
    disciplinaNome: turma.disciplinaNome || turma.disciplina?.nome || '',
    semestre: turma.semestre || '',
    ano: turma.ano === undefined ? undefined : Number(turma.ano),
    vagas: turma.vagas === undefined ? undefined : Number(turma.vagas),
  };
}

export async function listarTurmas() {
  const response = await api.get('/turmas');
  return extractList<TurmaApiResponse>(response.data).map(normalizeTurma);
}

export async function buscarTurmaPorId(id: number) {
  // PENDÊNCIA BACKEND: não existe GET /turmas/{id}.
  const response = await api.get<TurmaApiResponse>(`/turmas/${id}`);
  return normalizeTurma(response.data);
}

export async function criarTurma(payload: TurmaPayload) {
  const response = await api.post<TurmaApiResponse>('/turmas', {
    professorId: Number(payload.professorId),
    disciplinaId: Number(payload.disciplinaId),
    semestre: payload.semestre,
    ano: Number(payload.ano),
    vagas: Number(payload.vagas),
  });
  return normalizeTurma(response.data);
}

export async function atualizarTurma(id: number, payload: TurmaPayload) {
  const response = await api.put<TurmaApiResponse>(`/turmas/${id}`, {
    professorId: Number(payload.professorId),
    disciplinaId: Number(payload.disciplinaId),
    semestre: payload.semestre,
    ano: Number(payload.ano),
    vagas: Number(payload.vagas),
  });
  return response.data
    ? normalizeTurma(response.data)
    : normalizeTurma({ id, ...payload });
}

export async function excluirTurma(id: number) {
  await api.delete(`/turmas/${id}`);
}

export function getTurmaName(turma: Turma) {
  return turma.semestre || `Turma #${turma.id}`;
}

export function getTurmaYear(turma: Turma) {
  return turma.ano ?? '';
}
