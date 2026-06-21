import { LoaderCircle } from 'lucide-react';

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({
  label = 'Carregando informações...',
}: LoadingStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground shadow-[0_8px_24px_-22px_rgba(15,23,42,0.4)]">
      <span className="rounded-2xl bg-siga-blue-50 p-3 dark:bg-primary/10"><LoaderCircle className="h-6 w-6 animate-spin text-primary" /></span>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
