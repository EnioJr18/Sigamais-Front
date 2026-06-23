import { api } from './api';

export type NivelRisco = 'ALTO' | 'MEDIO' | 'BAIXO';

export interface RiscoResponse {
  risco: NivelRisco;
  media?: number;
  faltas?: number;
  motivos?: string[];
}

export interface RiscoProfessor {
  matriculaId: number;
  alunoNome: string;
  alunoMatricula: string;
  disciplinaNome: string;
  professorNome: string;
  semestre: string;
  risco: NivelRisco;
  media?: number;
  faltas?: number;
  motivos: string[];
}

interface RiscoProfessorRaw {
  matriculaId?: number | string;
  alunoNome?: string;
  alunoMatricula?: string;
  disciplinaNome?: string;
  disciplina?: string;
  professorNome?: string;
  semestre?: string;
  risco?: RiscoResponse | NivelRisco;
  media?: number;
  faltas?: number;
  motivos?: string[];
}

function normalizeNivelRisco(value: unknown) {
  const risco = String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase() as NivelRisco;

  if (!['ALTO', 'MEDIO', 'BAIXO'].includes(risco)) {
    throw new Error('Nível de risco inválido.');
  }

  return risco;
}

export async function buscarRiscoDaMatricula(id: number) {
  const response = await api.get<RiscoResponse | NivelRisco>(
    `/matriculas/${id}/risco`,
  );
  const data =
    typeof response.data === 'string'
      ? { risco: response.data }
      : response.data;

  return {
    risco: normalizeNivelRisco(data.risco),
    media: data.media === undefined ? undefined : Number(data.media),
    faltas: data.faltas === undefined ? undefined : Number(data.faltas),
    motivos: Array.isArray(data.motivos) ? data.motivos : undefined,
  };
}

export async function listarRiscosDoProfessor() {
  const response = await api.get<RiscoProfessorRaw[]>(
    '/usuarios/me/professor/risco',
  );

  return response.data.map(item => {
    const detail =
      item.risco && typeof item.risco === 'object' ? item.risco : item;
    const level =
      typeof item.risco === 'string' ? item.risco : detail.risco;

    return {
      matriculaId: Number(item.matriculaId),
      alunoNome: item.alunoNome ?? 'Aluno não identificado',
      alunoMatricula: item.alunoMatricula ?? 'Não informada',
      disciplinaNome:
        item.disciplinaNome ?? item.disciplina ?? 'Disciplina não informada',
      professorNome: item.professorNome ?? 'Professor logado',
      semestre: item.semestre ?? 'Semestre não informado',
      risco: normalizeNivelRisco(level),
      media: detail.media === undefined ? undefined : Number(detail.media),
      faltas: detail.faltas === undefined ? undefined : Number(detail.faltas),
      motivos: Array.isArray(detail.motivos) ? detail.motivos : [],
    } satisfies RiscoProfessor;
  });
}
