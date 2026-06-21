import { useQueryClient } from '@tanstack/react-query';
import { LogOut, Menu, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { getCurrentUser } from '../../lib/rbac';
import { clearToken } from '../../services/auth';
import { ThemeToggle } from '../theme/ThemeToggle';
import { Button } from '../ui/button';

interface HeaderProps {
  onMenuClick: () => void;
}

function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  const handleLogout = () => {
    clearToken();
    queryClient.clear();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-header/95 shadow-[0_6px_24px_-22px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:shadow-none">
      <div className="flex h-[4.25rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-sm font-bold tracking-tight text-primary">Painel SIGA+</p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Instituto Federal de Alagoas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden border-r border-border pr-3 text-right sm:block">
            <p className="max-w-48 truncate text-sm font-medium text-foreground">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {user.role ?? 'Perfil não informado'}
            </p>
          </div>
          <ThemeToggle />
          <span className="grid h-9 w-9 place-items-center rounded-full bg-siga-blue-50 text-primary ring-1 ring-inset ring-primary/15 dark:bg-primary/10">
            <UserRound className="h-4 w-4" />
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Sair do sistema"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
