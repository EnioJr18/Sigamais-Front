import { api } from './api';

export type NivelRisco = 'ALTO' | 'MEDIO' | 'BAIXO';

export interface RiscoResponse {
  risco: NivelRisco;
  media?: number;
  faltas?: number;
  motivos?: string[];
}

export async function buscarRiscoDaMatricula(id: number) {
  const response = await api.get<RiscoResponse | NivelRisco>(
    `/matriculas/${id}/risco`,
  );

  const data = typeof response.data === 'string'
    ? { risco: response.data }
    : response.data;
  const value = data.risco;
  const risco = String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase() as NivelRisco;

  if (!['ALTO', 'MEDIO', 'BAIXO'].includes(risco)) {
    throw new Error('Nível de risco inválido.');
  }

  return {
    risco,
    media: data.media === undefined ? undefined : Number(data.media),
    faltas: data.faltas === undefined ? undefined : Number(data.faltas),
    motivos: Array.isArray(data.motivos) ? data.motivos : undefined,
  };
}
