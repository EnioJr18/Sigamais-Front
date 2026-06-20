import { api } from './api';

export type NivelRisco = 'ALTO' | 'MEDIO' | 'BAIXO';

export interface RiscoResponse {
  risco: NivelRisco;
}

export async function buscarRiscoDaMatricula(id: number) {
  const response = await api.get<RiscoResponse | NivelRisco>(
    `/matriculas/${id}/risco`,
  );

  return typeof response.data === 'string'
    ? { risco: response.data }
    : response.data;
}
