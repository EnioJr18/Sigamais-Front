import { getToken } from '../services/auth';

export type UserRole = 'ADMIN' | 'PROFESSOR' | 'ALUNO';

interface JwtPayload {
  role?: string;
  perfil?: string;
  roles?: string[] | string;
  authorities?: string[] | string;
  nome?: string;
  name?: string;
  sub?: string;
}

function decodePayload(token: string): JwtPayload | null {
  try {
    const encoded = token.split('.')[1];
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(character =>
          `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`,
        )
        .join(''),
    );

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  const token = getToken();
  const payload = token ? decodePayload(token) : null;
  const rawRoles = [
    payload?.role,
    payload?.perfil,
    ...(Array.isArray(payload?.roles) ? payload.roles : [payload?.roles]),
    ...(Array.isArray(payload?.authorities)
      ? payload.authorities
      : [payload?.authorities]),
  ].filter(Boolean) as string[];
  const role = rawRoles
    .map(value => value.replace('ROLE_', '').toUpperCase())
    .find(value => ['ADMIN', 'PROFESSOR', 'ALUNO'].includes(value)) as
    | UserRole
    | undefined;

  return {
    name: payload?.nome ?? payload?.name ?? payload?.sub ?? 'Usuário SIGA+',
    role,
  };
}

export function canManageStructure() {
  const { role } = getCurrentUser();

  // Mantém o CRUD disponível enquanto o backend não inclui o perfil no JWT.
  return role === 'ADMIN' || role === undefined;
}

export function canManageAcademicRecords() {
  const { role } = getCurrentUser();

  // Mantém o fluxo disponível enquanto o backend não inclui o perfil no JWT.
  return role === 'ADMIN' || role === 'PROFESSOR' || role === undefined;
}
