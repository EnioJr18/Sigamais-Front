import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'flex h-11 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground shadow-sm transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 hover:border-primary/35 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60',
      className,
    )}
    {...props}
  />
));

Input.displayName = 'Input';

export { Input };
