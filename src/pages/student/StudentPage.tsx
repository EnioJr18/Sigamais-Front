import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface StudentPageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}

export function StudentPage({
  icon: Icon,
  title,
  description,
  children,
}: StudentPageProps) {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header>
        <div className="flex items-center gap-2 text-accent">
          <Icon className="h-4 w-4" />
          <p className="text-sm font-medium">Portal do aluno</p>
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </header>
      {children}
    </section>
  );
}
