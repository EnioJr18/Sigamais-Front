import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  ScrollText,
  SquarePen,
  UserRound,
  Users,
} from 'lucide-react';

const items = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Alunos', to: '/alunos', icon: Users },
  { label: 'Professores', to: '/professores', icon: UserRound },
  { label: 'Turmas', to: '/turmas', icon: GraduationCap },
  { label: 'Disciplinas', to: '/disciplinas', icon: BookOpen },
  { label: 'Notas', to: '/notas', icon: SquarePen },
  { label: 'Frequência', to: '/frequencia', icon: ScrollText },
];

function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-lg font-semibold tracking-wide text-white">
            Siga-Plus
          </p>
          <p className="text-sm text-slate-400">
            Cadastro e acompanhamento escolar
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
                    : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
                ].join(' ')
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
