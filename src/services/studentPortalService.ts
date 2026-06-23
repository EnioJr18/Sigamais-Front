import { api } from './api';

export interface MinhaTurma {
  id: number;
  alunoMatricula?: string;
  disciplinaNome: string;
  professorNome: string;
  semestre: string;
  ano: number;
}

export type SituacaoAluno = 'APROVADO' | 'RECUPERACAO' | 'REPROVADO';

export interface NotaIndividualAluno {
  id: number;
  tipo: string;
  valor: number;
}

export interface MinhaNota {
  matriculaId: number;
  alunoNome: string;
  alunoMatricula: string;
  disciplinaNome: string;
  professorNome: string;
  semestre: string;
  media: number;
  quantidadeNotas: number;
  situacao: SituacaoAluno;
  notas: NotaIndividualAluno[];
}

export interface MinhaFrequencia {
  matriculaId: number;
  alunoNome: string;
  alunoMatricula: string;
  disciplinaNome: string;
  professorNome: string;
  semestre: string;
  totalFaltas: number;
  quantidadeRegistros: number;
}

export type NivelRiscoAluno = 'ALTO' | 'MEDIO' | 'BAIXO';

export interface RiscoAluno {
  risco: NivelRiscoAluno;
  media?: number;
  faltas?: number;
  motivos: string[];
}

export interface MeuRisco {
  disciplinaNome: string;
  risco: RiscoAluno;
}

interface MeuRiscoResponse {
  disciplina?: string;
  disciplinaNome?: string;
  risco?: Partial<RiscoAluno>;
}

export async function listarMinhasTurmas() {
  const response = await api.get<MinhaTurma[]>('/usuarios/me/matriculas');
  return response.data;
}

export async function listarMinhasNotas() {
  const response = await api.get<MinhaNota[]>('/usuarios/me/notas');
  return response.data.map(item => ({
    ...item,
    matriculaId: Number(item.matriculaId),
    media: Number(item.media),
    quantidadeNotas: Number(item.quantidadeNotas),
    notas: Array.isArray(item.notas)
      ? item.notas.map(nota => ({
          ...nota,
          id: Number(nota.id),
          valor: Number(nota.valor),
        }))
      : [],
  }));
}

export async function listarMinhaFrequencia() {
  const response = await api.get<MinhaFrequencia[]>('/usuarios/me/frequencias');
  return response.data;
}

export async function listarMeuRisco() {
  const response = await api.get<MeuRiscoResponse[]>('/usuarios/me/risco');

  return response.data.map(item => ({
    disciplinaNome:
      item.disciplinaNome ?? item.disciplina ?? 'Disciplina não informada',
    risco: {
      risco: item.risco?.risco ?? 'BAIXO',
      media: item.risco?.media,
      faltas: item.risco?.faltas,
      motivos: Array.isArray(item.risco?.motivos) ? item.risco.motivos : [],
    },
  }));
}
