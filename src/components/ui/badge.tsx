import * as React from 'react';

import { cn } from '@/lib/utils';

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: 'default' | 'outline' | 'soft';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800 ring-1 ring-inset ring-slate-200',
    outline: 'border border-slate-200 text-slate-700',
    soft: 'bg-slate-900/60 text-slate-100 ring-1 ring-inset ring-white/10',
  };

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});

Badge.displayName = 'Badge';

export { Badge };
