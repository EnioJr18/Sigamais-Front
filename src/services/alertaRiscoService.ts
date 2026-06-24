import { api } from './api';
import { extractList } from './http';

export type StatusAlerta = 'PENDENTE' | 'EM_ACOMPANHAMENTO' | 'RESOLVIDO';
export type NivelRiscoAlerta = 'ALTO' | 'MEDIO' | 'BAIXO';

export interface AlertaRisco {
  id: number;
  alunoNome: string;
  alunoMatricula: string;
  disciplinaNome: string;
  professorNome: string;
  risco: NivelRiscoAlerta;
  media?: number;
  faltas?: number;
  motivos: string[];
  status: StatusAlerta;
  observacao: string;
  criadoEm?: string;
}

export interface AtualizarAlertaRiscoPayload {
  status: StatusAlerta;
  observacao: string;
}

export interface HistoricoAlertaRisco {
  id: number;
  status: StatusAlerta;
  observacao: string;
  criadoEm?: string;
  responsavelNome: string;
}

interface HistoricoAlertaRiscoRaw {
  id?: number | string;
  status?: string;
  observacao?: string | null;
  criadoEm?: string | null;
  responsavelNome?: string | null;
}

interface AlertaRiscoRaw {
  id?: number | string;
  alunoNome?: string;
  alunoMatricula?: string;
  disciplinaNome?: string;
  disciplina?: string;
  professorNome?: string;
  risco?: string;
  media?: number | string | null;
  faltas?: number | string | null;
  motivos?: string[] | string | null;
  status?: string;
  observacao?: string | null;
  criadoEm?: string | null;
}

function normalizeEnum(value: unknown) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

function normalizeRisk(value: unknown): NivelRiscoAlerta {
  const risk = normalizeEnum(value);
  return risk === 'MEDIO' || risk === 'BAIXO' ? risk : 'ALTO';
}

function normalizeStatus(value: unknown): StatusAlerta {
  const status = normalizeEnum(value);
  if (status === 'EM_ACOMPANHAMENTO' || status === 'RESOLVIDO') {
    return status;
  }
  return 'PENDENTE';
}

function normalizeReasons(value: AlertaRiscoRaw['motivos']) {
  if (Array.isArray(value)) {
    return value.map(String).map(item => item.trim()).filter(Boolean);
  }
  if (typeof value !== 'string') return [];

  return value
    .split(/\r?\n/)
    .map(item => item.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean);
}

function normalizeAlert(item: AlertaRiscoRaw): AlertaRisco {
  return {
    id: Number(item.id),
    alunoNome: item.alunoNome ?? 'Aluno não identificado',
    alunoMatricula: item.alunoMatricula ?? 'Não informada',
    disciplinaNome:
      item.disciplinaNome ?? item.disciplina ?? 'Disciplina não informada',
    professorNome: item.professorNome ?? 'Não informado',
    risco: normalizeRisk(item.risco),
    media:
      item.media === undefined || item.media === null
        ? undefined
        : Number(item.media),
    faltas:
      item.faltas === undefined || item.faltas === null
        ? undefined
        : Number(item.faltas),
    motivos: normalizeReasons(item.motivos),
    status: normalizeStatus(item.status),
    observacao: item.observacao ?? '',
    criadoEm: item.criadoEm ?? undefined,
  };
}

export async function listarAlertasRisco() {
  const response = await api.get('/alertas-risco');
  return extractList<AlertaRiscoRaw>(response.data).map(normalizeAlert);
}

export async function atualizarAlertaRisco(
  id: number,
  payload: AtualizarAlertaRiscoPayload,
) {
  await api.put(`/alertas-risco/${id}`, {
    status: payload.status,
    observacao: payload.observacao,
  });
}

export async function notificarCoordenacao(matriculaId: number) {
  await api.post(`/alertas-risco/${matriculaId}/notificar`);
}

export async function listarHistoricoAlertaRisco(id: number) {
  const response = await api.get(`/alertas-risco/${id}/historico`);

  return extractList<HistoricoAlertaRiscoRaw>(response.data)
    .map(item => ({
      id: Number(item.id),
      status: normalizeStatus(item.status),
      observacao: item.observacao?.trim() || 'Sem observação registrada.',
      criadoEm: item.criadoEm ?? undefined,
      responsavelNome: item.responsavelNome?.trim() || 'Não informado',
    }))
    .sort((first, second) => {
      const firstDate = first.criadoEm ? Date.parse(first.criadoEm) : 0;
      const secondDate = second.criadoEm ? Date.parse(second.criadoEm) : 0;
      return firstDate - secondDate;
    });
}
