import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { hasToken } from '../../services/auth';

function ProtectedRoute() {
  const [authenticated, setAuthenticated] = useState(hasToken);

  useEffect(() => {
    const handleUnauthorized = () => setAuthenticated(false);

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () =>
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
