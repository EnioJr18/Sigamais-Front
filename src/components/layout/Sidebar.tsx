import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  Siren,
  SquarePen,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { getCurrentUser, type UserRole } from '../../lib/rbac';
import { Button } from '../ui/button';

const items: Array<{
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[];
}> = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Alunos', to: '/alunos', icon: Users },
  { label: 'Professores', to: '/professores', icon: UserRound },
  { label: 'Turmas', to: '/turmas', icon: GraduationCap },
  { label: 'Disciplinas', to: '/disciplinas', icon: BookOpen },
  { label: 'Matrículas', to: '/matriculas', icon: ClipboardList },
  {
    label: 'Notas',
    to: '/notas',
    icon: SquarePen,
    roles: ['ADMIN', 'PROFESSOR', 'ALUNO'],
  },
  {
    label: 'Frequência',
    to: '/frequencia',
    icon: ScrollText,
    roles: ['ADMIN', 'PROFESSOR', 'ALUNO'],
  },
  { label: 'Alerta de Risco', to: '/risco', icon: Siren },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { role } = getCurrentUser();
  const visibleItems = items.filter(
    item => !item.roles || !role || item.roles.includes(role),
  );

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-siga-blue-900/45 backdrop-blur-sm dark:bg-slate-950/75 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-sidebar p-5 shadow-[4px_0_24px_-18px_rgba(15,74,138,0.28)] transition-transform duration-300 dark:shadow-2xl lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-lg font-black text-primary-foreground shadow-lg shadow-primary/20">
              S+
            </span>
            <div>
              <p className="font-semibold tracking-wide text-primary">SIGA+</p>
              <p className="text-xs text-muted-foreground">Gestão acadêmica</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="my-6 h-px bg-border" />

        <nav className="flex-1 space-y-1" aria-label="Navegação principal">
          {visibleItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-inset ring-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                ].join(' ')
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="rounded-2xl border border-accent/20 bg-secondary p-4">
          <div className="flex items-center gap-2 text-secondary-foreground">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-sm font-medium">Acesso seguro</p>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Sessão protegida por JWT e permissões acadêmicas.
          </p>
        </div>
      </aside>
    </>
  );
}
