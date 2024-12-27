import { type ReactNode, type ReactElement } from 'react';

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <div className="min-h-screen">
      <main>
        {children}
      </main>
    </div>
  );
} 