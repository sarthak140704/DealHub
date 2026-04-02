'use client';

import { Sidebar } from '@/components/Sidebar';
import { useTRPC } from '@/app/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const trpc = useTRPC();
  const router = useRouter();
  const { data: session, isLoading } = useQuery(trpc.auth.getSession.queryOptions());

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login');
    }
  }, [session, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.role as 'CUSTOMER' | 'VENDOR' | 'ADMIN'} />
      <main className="flex-1 lg:ml-0 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
