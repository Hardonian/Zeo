import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium motion-safe:transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50';

const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
  outline: 'border border-border text-foreground hover:bg-muted/70',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-sm',
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cx(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    />
  )
);

Button.displayName = 'Button';

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  external?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function ButtonLink({ href, external = false, variant = 'primary', size = 'md', className, ...props }: ButtonLinkProps) {
  const classes = cx(baseClasses, variants[variant], sizes[size], className);

  if (external) {
    return <a href={href} className={classes} rel="noopener noreferrer" target="_blank" {...props} />;
  }

  return <Link href={href} className={classes} {...props} />;
}
