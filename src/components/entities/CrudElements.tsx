import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Edit3, Trash2 } from 'lucide-react';

import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Modal } from '../ui/modal';

export type Feedback = {
  type: 'success' | 'error';
  message: string;
};

export function FeedbackBanner({ feedback }: { feedback: Feedback }) {
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${
        feedback.type === 'success'
          ? 'border-success/25 bg-success/10 text-success dark:text-success-foreground'
          : 'border-destructive/25 bg-destructive/10 text-destructive dark:text-red-100'
      }`}
    >
      {feedback.type === 'success' ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0" />
      )}
      {feedback.message}
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:text-red-100">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      {children}
      {error && <p className="flex items-center gap-1 text-xs font-medium text-destructive"><AlertCircle className="h-3 w-3" />{error}</p>}
    </div>
  );
}

export function RowActions<T>({
  item,
  label,
  onEdit,
  onDelete,
}: {
  item: T;
  label: string;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(item)}
        aria-label={`Editar ${label}`}
        className="text-primary hover:bg-primary/10 hover:text-primary"
      >
        <Edit3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(item)}
        aria-label={`Excluir ${label}`}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function DeleteConfirmation({
  open,
  entityLabel,
  itemLabel,
  pending,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean;
  entityLabel: string;
  itemLabel: string;
  pending: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      title={`Excluir ${entityLabel}`}
      description="Esta ação não poderá ser desfeita."
      onClose={onClose}
    >
      {error && <InlineError message={error} />}
      <p className={`text-sm leading-6 text-muted-foreground ${error ? 'mt-4' : ''}`}>
        Confirma a exclusão de{' '}
        <strong className="text-foreground">{itemLabel}</strong>?
      </p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          disabled={pending}
          variant="destructive"
        >
          <Trash2 className="h-4 w-4" />
          {pending ? 'Excluindo...' : 'Excluir'}
        </Button>
      </div>
    </Modal>
  );
}
