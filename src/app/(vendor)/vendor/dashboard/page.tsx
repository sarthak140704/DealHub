'use client';

import { useTRPC } from '@/app/trpc/client';
import { useQuery } from '@tanstack/react-query';

export default function VendorDashboard() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.vendor.getDashboardStats.queryOptions());

  const stats = [
    { label: 'Total Deals', value: data?.total ?? '—', icon: '🏷️', testId: 'total-deals', color: 'from-primary to-primary/60' },
    { label: 'Active Deals', value: data?.active ?? '—', icon: '✅', testId: 'active-deals', color: 'from-success to-success/60' },
    { label: 'Pending Approval', value: data?.pending ?? '—', icon: '⏳', testId: 'pending-deals', color: 'from-yellow-500 to-yellow-500/60' },
    { label: 'Expired', value: data?.expired ?? '—', icon: '📅', testId: 'expired-deals', color: 'from-muted-foreground to-muted-foreground/60' },
  ];

  return (
    <div className="max-w-5xl mx-auto" data-testid="vendor-dashboard">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Vendor Dashboard</h1>
        <p className="text-muted-foreground">
          {data?.companyName ? `Welcome, ${data.companyName}` : 'Overview of your deals'}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.testId}
            data-testid={stat.testId}
            className="bg-card border border-border rounded-2xl p-5 hover-lift animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl mb-3 shadow-md`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold">
              {isLoading ? <div className="h-8 w-12 animate-shimmer rounded" /> : stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
