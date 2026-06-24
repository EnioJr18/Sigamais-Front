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

type OperationErrorOptions = {
  badRequest: string;
  conflict?: string;
  fallback?: string;
};

function extractApiErrorDetail(data: unknown) {
  if (typeof data === 'string') return data.trim();
  if (!data || typeof data !== 'object') return '';

  const record = data as Record<string, unknown>;
  const detail =
    record.message ??
    record.mensagem ??
    record.erro ??
    record.error ??
    record.detail;

  return typeof detail === 'string' ? detail.trim() : '';
}

export function getOperationErrorMessage(
  error: unknown,
  {
    badRequest,
    conflict =
      'Não foi possível concluir a operação porque existem dados vinculados.',
    fallback = 'Não foi possível concluir a operação.',
  }: OperationErrorOptions,
) {
  if (!axios.isAxiosError(error)) return fallback;
  if (!error.response) return 'Não foi possível conectar à API.';

  const detail = extractApiErrorDetail(error.response.data);

  switch (error.response.status) {
    case 400:
      return detail || badRequest;
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    case 403:
      return 'Você não tem permissão para realizar esta ação.';
    case 404:
      return 'Registro não encontrado.';
    case 409:
      return detail || conflict;
    default:
      return detail || fallback;
  }
}
