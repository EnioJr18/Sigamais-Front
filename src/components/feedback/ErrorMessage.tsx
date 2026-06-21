import { AlertTriangle } from 'lucide-react';

import { Button } from '../ui/button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  title = 'Algo não saiu como esperado',
  message,
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/20 bg-red-50/70 p-8 text-center dark:bg-destructive/5">
      <span className="rounded-2xl bg-destructive/10 p-3"><AlertTriangle className="h-6 w-6 text-destructive" /></span>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 max-w-lg text-sm leading-6 text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
