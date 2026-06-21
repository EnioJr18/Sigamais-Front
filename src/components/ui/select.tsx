import * as React from 'react';

import { cn } from '@/lib/utils';

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-11 w-full appearance-none rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow] hover:border-primary/35 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60',
      className,
    )}
    {...props}
  >
    {children}
  </select>
));

Select.displayName = 'Select';

export { Select };
