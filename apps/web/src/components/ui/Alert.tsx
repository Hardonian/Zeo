import type { HTMLAttributes } from 'react';

const variants = {
  default: 'border-border bg-muted text-foreground',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

export type AlertVariant = keyof typeof variants;

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

export function Alert({ variant = 'default', className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cx('rounded-lg border px-4 py-3 text-sm', variants[variant], className)}
      {...props}
    />
  );
}
