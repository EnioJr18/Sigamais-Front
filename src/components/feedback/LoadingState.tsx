import { LoaderCircle } from 'lucide-react';

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({
  label = 'Carregando informações...',
}: LoadingStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-muted/40 p-8 text-center text-muted-foreground">
      <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
