'use client';

import { useTRPC } from '@/app/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/EmptyState';

export default function VendorAnalyticsPage() {
  const trpc = useTRPC();
  const { data: analytics, isLoading } = useQuery(trpc.vendor.getAnalytics.queryOptions());

  const totalClicks = analytics?.reduce((sum, d) => sum + d.clicks, 0) ?? 0;
  const totalSaves = analytics?.reduce((sum, d) => sum + d.saves, 0) ?? 0;

  return (
    <div className="max-w-5xl mx-auto" data-testid="vendor-analytics-page">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track performance of your deals</p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-5 animate-fade-in">
          <div className="text-sm text-muted-foreground mb-1">Total Clicks</div>
          <div className="text-3xl font-bold gradient-text">{isLoading ? '—' : totalClicks.toLocaleString()}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '80ms' }}>
          <div className="text-sm text-muted-foreground mb-1">Total Saves</div>
          <div className="text-3xl font-bold gradient-text">{isLoading ? '—' : totalSaves.toLocaleString()}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '160ms' }}>
          <div className="text-sm text-muted-foreground mb-1">Deals Tracked</div>
          <div className="text-3xl font-bold gradient-text">{isLoading ? '—' : analytics?.length ?? 0}</div>
        </div>
      </div>

      {/* Details Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : !analytics || analytics.length === 0 ? (
        <EmptyState
          icon="📈"
          title="No Analytics Yet"
          description="Submit deals to start tracking their performance."
        />
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden animate-fade-in">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Deal</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Clicks</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Saves</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Reviews</th>
              </tr>
            </thead>
            <tbody>
              {analytics.map((deal, i) => (
                <tr
                  key={deal.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <td className="p-4 text-sm font-medium truncate max-w-[300px]">{deal.title}</td>
                  <td className="p-4 text-center"><StatusBadge status={deal.status} /></td>
                  <td className="p-4 text-center text-sm">{deal.clicks.toLocaleString()}</td>
                  <td className="p-4 text-center text-sm">{deal.saves}</td>
                  <td className="p-4 text-center text-sm">{deal.reviews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
