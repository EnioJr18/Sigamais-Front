import * as React from 'react';

import { cn } from '@/lib/utils';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

const buttonVariants = {
  default:
    'bg-primary text-primary-foreground shadow-[0_8px_18px_-10px_rgba(21,87,166,0.9)] hover:-translate-y-0.5 hover:bg-primary-hover focus-visible:ring-ring',
  outline:
    'border border-border bg-card text-foreground shadow-sm hover:-translate-y-0.5 hover:border-primary/25 hover:bg-siga-blue-50 hover:text-primary dark:hover:bg-muted focus-visible:ring-ring',
  secondary:
    'bg-accent text-accent-foreground shadow-[0_8px_18px_-10px_rgba(244,124,32,0.9)] hover:-translate-y-0.5 hover:bg-accent-hover focus-visible:ring-accent',
  ghost:
    'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring',
  destructive:
    'bg-destructive text-destructive-foreground shadow-sm hover:opacity-90 focus-visible:ring-destructive',
};

const sizeVariants = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-lg px-3 text-sm',
  lg: 'h-11 rounded-xl px-6',
  icon: 'h-10 w-10',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      type = 'button',
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
        buttonVariants[variant],
        sizeVariants[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = 'Button';

export { Button };
