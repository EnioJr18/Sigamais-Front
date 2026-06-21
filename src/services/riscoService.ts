import { api } from './api';

export type NivelRisco = 'ALTO' | 'MEDIO' | 'BAIXO';

export interface RiscoResponse {
  risco: NivelRisco;
}

export async function buscarRiscoDaMatricula(id: number) {
  const response = await api.get<RiscoResponse | NivelRisco>(
    `/matriculas/${id}/risco`,
  );

  const value = typeof response.data === 'string'
    ? response.data
    : response.data.risco;
  const risco = String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase() as NivelRisco;

  if (!['ALTO', 'MEDIO', 'BAIXO'].includes(risco)) {
    throw new Error('Nível de risco inválido.');
  }

  return { risco };
}
