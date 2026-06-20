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
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-3xl border border-destructive/25 bg-destructive/5 p-8 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-destructive/80">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
