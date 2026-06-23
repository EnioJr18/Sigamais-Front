import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import {
  getCurrentUser,
  hasAllowedRole,
  normalizeUserRole,
  type UserRole,
} from '../../lib/rbac';
import { hasToken } from '../../services/auth';
import { getMeuPerfil } from '../../services/profileService';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const [authenticated, setAuthenticated] = useState(hasToken);
  const location = useLocation();
  const tokenUser = getCurrentUser();
  const needsProfileLookup =
    authenticated && Boolean(allowedRoles) && tokenUser.role === undefined;
  const profileQuery = useQuery({
    queryKey: ['meu-perfil'],
    queryFn: getMeuPerfil,
    enabled: needsProfileLookup,
  });
  const profileRole = normalizeUserRole(profileQuery.data?.perfil);
  const role = tokenUser.role ?? profileRole;

  useEffect(() => {
    const handleUnauthorized = () => setAuthenticated(false);

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () =>
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV && allowedRoles) {
      console.debug('[SIGA+ RBAC]', {
        perfilBruto: tokenUser.rawRole,
        perfilDaApi: profileQuery.data?.perfil,
        perfilNormalizado: role,
        rotaAtual: location.pathname,
        perfisPermitidos: allowedRoles,
      });
    }
  }, [
    allowedRoles,
    location.pathname,
    profileQuery.data?.perfil,
    role,
    tokenUser.rawRole,
  ]);

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (needsProfileLookup && profileQuery.isLoading) {
    return (
      <div className="grid min-h-48 place-items-center text-sm text-muted-foreground">
        Validando acesso...
      </div>
    );
  }

  if (allowedRoles && !hasAllowedRole(allowedRoles, role)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
