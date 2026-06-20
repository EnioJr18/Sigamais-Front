import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

import { Button } from './button';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-siga-blue-900/45 p-0 backdrop-blur-sm dark:bg-slate-950/80 sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-border bg-popover p-6 text-popover-foreground shadow-2xl sm:max-w-lg sm:rounded-3xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold text-foreground">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fechar"
            className="text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
