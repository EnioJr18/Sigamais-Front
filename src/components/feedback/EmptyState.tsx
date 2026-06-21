import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-slate-50/70 p-8 text-center dark:bg-muted/30">
      <span className="rounded-2xl bg-siga-blue-50 p-3 text-primary ring-1 ring-inset ring-primary/10 dark:bg-primary/10">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
