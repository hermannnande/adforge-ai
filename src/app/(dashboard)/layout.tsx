import type { ReactNode } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardTopbar } from '@/components/layout/dashboard-topbar';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  let userId: string | null = null;

  try {
    const session = await auth();
    userId = session.userId;
  } catch (error) {
    console.error('[DashboardLayout] auth() failed:', error);
  }

  if (!userId) {
    redirect('/login');
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
