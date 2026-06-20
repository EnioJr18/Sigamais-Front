import * as React from 'react';

import { cn } from '@/lib/utils';

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: 'default' | 'outline' | 'soft';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/20',
    outline: 'border border-border text-foreground',
    soft: 'bg-secondary text-secondary-foreground ring-1 ring-inset ring-accent/20',
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
