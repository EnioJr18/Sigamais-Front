import { api } from './api';

export interface MeuPerfil {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  perfil: string;
  telefone: string;
  endereco: string;
  fotoPerfilUrl: string;
}

export interface AtualizarPerfilPayload {
  nome: string;
  telefone: string;
  endereco: string;
  fotoPerfilUrl: string;
}

export interface AlterarSenhaPayload {
  senhaAtual: string;
  novaSenha: string;
}

export async function getMeuPerfil() {
  const response = await api.get<MeuPerfil>('/usuarios/me');
  return response.data;
}

export async function atualizarMeuPerfil(payload: AtualizarPerfilPayload) {
  const response = await api.put<MeuPerfil>('/usuarios/me', payload);
  return response.data;
}

export async function alterarMinhaSenha(payload: AlterarSenhaPayload) {
  await api.put('/usuarios/me/senha', payload);
}
