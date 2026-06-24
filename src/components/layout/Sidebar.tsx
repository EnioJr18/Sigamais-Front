import {
  BellRing,
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  CircleUserRound,
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
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';

import {
  getCurrentUser,
  normalizeUserRole,
  type UserRole,
} from '../../lib/rbac';
import { getMeuPerfil } from '../../services/profileService';
import { Button } from '../ui/button';

const items: Array<{
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[];
}> = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Alunos', to: '/alunos', icon: Users, roles: ['ADMIN'] },
  { label: 'Professores', to: '/professores', icon: UserRound, roles: ['ADMIN'] },
  { label: 'Turmas', to: '/turmas', icon: GraduationCap, roles: ['ADMIN'] },
  { label: 'Disciplinas', to: '/disciplinas', icon: BookOpen, roles: ['ADMIN'] },
  { label: 'Matrículas', to: '/matriculas', icon: ClipboardList, roles: ['ADMIN'] },
  {
    label: 'Notas',
    to: '/notas',
    icon: SquarePen,
    roles: ['ADMIN', 'PROFESSOR'],
  },
  {
    label: 'Frequência',
    to: '/frequencia',
    icon: ScrollText,
    roles: ['ADMIN', 'PROFESSOR'],
  },
  { label: 'Alerta de Risco', to: '/risco', icon: Siren, roles: ['ADMIN', 'PROFESSOR'] },
  { label: 'Alertas', to: '/alertas', icon: BellRing, roles: ['ADMIN'] },
  {
    label: 'Minhas turmas',
    to: '/minhas-turmas',
    icon: GraduationCap,
    roles: ['ALUNO'],
  },
  {
    label: 'Minhas notas',
    to: '/minhas-notas',
    icon: BookOpenCheck,
    roles: ['ALUNO'],
  },
  {
    label: 'Minha frequência',
    to: '/minha-frequencia',
    icon: CalendarCheck,
    roles: ['ALUNO'],
  },
  { label: 'Meu risco', to: '/meu-risco', icon: Siren, roles: ['ALUNO'] },
  { label: 'Meu perfil', to: '/perfil', icon: CircleUserRound },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const tokenUser = getCurrentUser();
  const profileQuery = useQuery({
    queryKey: ['meu-perfil'],
    queryFn: getMeuPerfil,
    enabled: tokenUser.role === undefined,
  });
  const role = tokenUser.role ?? normalizeUserRole(profileQuery.data?.perfil);
  const visibleItems = items.filter(
    item => !item.roles || (role !== undefined && item.roles.includes(role)),
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
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-sidebar px-4 py-5 shadow-[8px_0_30px_-26px_rgba(15,23,42,0.4)] transition-transform duration-300 dark:shadow-2xl lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary via-siga-blue-600 to-accent text-lg font-black text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-white/20">
              S+
            </span>
            <div>
              <p className="text-base font-bold tracking-tight text-primary">SIGA+</p>
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

        <div className="my-5 h-px bg-border" />

        <nav className="flex-1 space-y-1.5" aria-label="Navegação principal">
          {visibleItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_rgba(21,87,166,0.75)] ring-1 ring-inset ring-primary/20'
                    : 'text-muted-foreground hover:translate-x-0.5 hover:bg-siga-blue-50 hover:text-primary dark:hover:bg-muted dark:hover:text-foreground',
                ].join(' ')
              }
            >
              <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-5 rounded-xl border border-accent/20 bg-secondary p-4 shadow-sm">
          <div className="flex items-center gap-2 text-secondary-foreground">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-sm font-medium">Acesso seguro</p>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Cada usuário acessa apenas as informações correspondentes ao seu
            perfil acadêmico.
          </p>
        </div>
      </aside>
    </>
  );
}
