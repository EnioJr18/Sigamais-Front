import { getToken } from '../services/auth';

export type UserRole = 'ADMIN' | 'PROFESSOR' | 'ALUNO';

interface JwtPayload {
  role?: unknown;
  perfil?: unknown;
  roles?: unknown;
  authorities?: unknown;
  nome?: string;
  name?: string;
  sub?: string;
}

const USER_ROLES: UserRole[] = ['ADMIN', 'PROFESSOR', 'ALUNO'];

export function normalizeUserRole(value: unknown): UserRole | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/^ROLE[_:\-\s]*/, '');

  return USER_ROLES.find(role => role === normalized);
}

function collectRoleClaims(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectRoleClaims);
  }

  if (value && typeof value === 'object') {
    const claim = value as Record<string, unknown>;
    return [claim.authority, claim.role, claim.perfil, claim.name].flatMap(
      collectRoleClaims,
    );
  }

  return [];
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
  const rawRoles = collectRoleClaims([
    payload?.role,
    payload?.perfil,
    payload?.roles,
    payload?.authorities,
  ]);
  const role = rawRoles.map(normalizeUserRole).find(Boolean);

  return {
    name: payload?.nome ?? payload?.name ?? payload?.sub ?? 'Usuário SIGA+',
    role,
    rawRole: rawRoles.length === 1 ? rawRoles[0] : rawRoles,
  };
}

export function canManageStructure() {
  const { role } = getCurrentUser();

  // As rotas administrativas aplicam a validação definitiva com /usuarios/me.
  return role === 'ADMIN' || role === undefined;
}

export function canManageAcademicRecords() {
  const { role } = getCurrentUser();

  // As rotas acadêmicas aplicam a validação definitiva com /usuarios/me.
  return role === 'ADMIN' || role === 'PROFESSOR' || role === undefined;
}

export function hasAllowedRole(
  allowedRoles: UserRole[],
  role = getCurrentUser().role,
) {
  return role !== undefined && allowedRoles.includes(role);
}
