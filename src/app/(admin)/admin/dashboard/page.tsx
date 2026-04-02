'use client';

import { useTRPC } from '@/app/trpc/client';
import { useQuery } from '@tanstack/react-query';

export default function AdminDashboard() {
  const trpc = useTRPC();
  const { data: usersData } = useQuery(trpc.users.getAll.queryOptions());
  const { data: dealsData } = useQuery(trpc.deals.getAllAdmin.queryOptions());
  const { data: logsData } = useQuery(trpc.auditLogs.getAll.queryOptions());

  const pendingCount = dealsData?.deals.filter((d) => d.status === 'PENDING_APPROVAL').length ?? 0;

  const stats = [
    { label: 'Total Users', value: usersData?.total ?? '—', icon: '👥', testId: 'total-users-stat', color: 'from-primary to-primary/60' },
    { label: 'Total Deals', value: dealsData?.total ?? '—', icon: '🏷️', testId: 'total-deals-stat', color: 'from-success to-success/60' },
    { label: 'Pending Approvals', value: pendingCount, icon: '⏳', testId: 'pending-approvals-stat', color: 'from-yellow-500 to-yellow-500/60' },
    { label: 'System Logs', value: logsData?.total ?? '—', icon: '📋', testId: 'system-logs-stat', color: 'from-secondary to-secondary/60' },
  ];

  return (
    <div className="max-w-6xl mx-auto" data-testid="admin-dashboard">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and management</p>
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
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
