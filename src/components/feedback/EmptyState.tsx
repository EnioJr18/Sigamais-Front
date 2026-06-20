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
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
      <span className="rounded-2xl bg-primary/10 p-3 text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
