import type { HTMLAttributes } from 'react';

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('rounded-md bg-muted/80 motion-safe:animate-pulse', className)}
      {...props}
    />
  );
}
