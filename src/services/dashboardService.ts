import { api } from './api';
import { extractList } from './http';

export type DashboardResource =
  | 'alunos'
  | 'professores'
  | 'turmas'
  | 'disciplinas'
  | 'matriculas';

export type DashboardSummary = Record<DashboardResource, number | null> & {
  unavailable: DashboardResource[];
};

const resources: DashboardResource[] = [
  'alunos',
  'professores',
  'turmas',
  'disciplinas',
  'matriculas',
];

export async function buscarResumoDashboard(): Promise<DashboardSummary> {
  const results = await Promise.allSettled(
    resources.map(async resource => {
      const response = await api.get(`/${resource}`);
      return extractList(response.data).length;
    }),
  );

  const summary = resources.reduce(
    (result, resource, index) => {
      const response = results[index];

      if (response.status === 'fulfilled') {
        result[resource] = response.value;
      } else {
        result[resource] = null;
        result.unavailable.push(resource);
      }

      return result;
    },
    {
      alunos: null,
      professores: null,
      turmas: null,
      disciplinas: null,
      matriculas: null,
      unavailable: [],
    } as DashboardSummary,
  );

  if (summary.unavailable.length === resources.length) {
    throw new Error('Nenhum dado do painel pôde ser carregado.');
  }

  return summary;
}
