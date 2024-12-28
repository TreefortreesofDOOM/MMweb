'use client';

import { type ReactNode } from 'react';

export function AuthForm({ 
  children,
  className,
  ...props
}: { 
  children: ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <form 
      method="post"
      className={className}
      suppressHydrationWarning
      {...props}
    >
      {children}
    </form>
  );
}  