import axios from 'axios';

export function extractList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const candidate = record.content ?? record.data ?? record.items;

    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  return [];
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Não foi possível concluir a operação.',
) {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data as
    | { message?: string; erro?: string; error?: string }
    | string
    | undefined;
  const detail =
    typeof data === 'string'
      ? data
      : data?.message ?? data?.erro ?? data?.error;

  if (detail) return detail;

  switch (error.response?.status) {
    case 400:
      return 'Os dados enviados são inválidos. Revise o formulário.';
    case 401:
      return 'Sua sessão expirou. Entre novamente para continuar.';
    case 403:
      return 'Seu usuário não tem permissão para realizar esta operação.';
    case 404:
      return 'O registro solicitado não foi encontrado.';
    case 409:
      return 'A operação conflita com uma regra de negócio ou registro existente.';
    default:
      return fallback;
  }
}
