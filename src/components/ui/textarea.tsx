import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-28 w-full rounded-xl border border-input bg-card px-3.5 py-3 text-sm text-foreground shadow-sm transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 hover:border-primary/35 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60',
      className,
    )}
    {...props}
  />
));

Textarea.displayName = 'Textarea';

export { Textarea };
