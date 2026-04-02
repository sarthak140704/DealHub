'use client';

import { useTRPC } from '@/app/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/EmptyState';

export default function AdminLogsPage() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.auditLogs.getAll.queryOptions());

  return (
    <div className="max-w-6xl mx-auto" data-testid="admin-logs-page">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
        <p className="text-muted-foreground">System activity and action history</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : !data || data.logs.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No Logs"
          description="System activity will appear here."
        />
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Action</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log, i) => (
                  <tr
                    key={log.id}
                    data-testid="log-row"
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="p-4 text-sm font-medium">{log.user.username}</td>
                    <td className="p-4 text-sm text-muted-foreground">{log.user.email}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        log.user.role === 'ADMIN'
                          ? 'bg-primary/10 text-primary'
                          : log.user.role === 'VENDOR'
                          ? 'bg-secondary/10 text-secondary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {log.user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
