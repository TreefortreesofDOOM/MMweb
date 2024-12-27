import { type ReactNode, type ReactElement } from 'react';

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactElement> {
  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-12 items-center justify-center min-h-[calc(100vh-4rem)]">
      <main>
        {children}
      </main>
    </div>
  );
} 