'use client';

import Link from 'next/link';
import { useTRPC } from '@/app/trpc/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatusBadge, EmptyState } from '@/components/EmptyState';
import { useToast } from '@/components/Toast';

export default function VendorDealsPage() {
  const trpc = useTRPC();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: deals, isLoading } = useQuery(trpc.vendor.getMyDeals.queryOptions());

  const deleteDeal = useMutation(
    trpc.deals.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.vendor.getMyDeals.queryOptions().queryKey });
        addToast('Deal deleted', 'success');
      },
      onError: (err) => addToast(err.message, 'error'),
    })
  );

  return (
    <div className="max-w-5xl mx-auto" data-testid="vendor-deals-page">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Deals</h1>
          <p className="text-muted-foreground">Manage your submitted deals</p>
        </div>
        <Link
          href="/vendor/deals/new"
          data-testid="submit-deal-button"
          className="px-5 py-2.5 rounded-xl gradient-bg text-white font-medium text-sm shadow-lg hover:opacity-90 transition-opacity"
        >
          + Submit New Deal
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : !deals || deals.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="No Deals Yet"
          description="Submit your first deal and start reaching customers!"
        />
      ) : (
        <div className="space-y-3">
          {deals.map((deal, i) => (
            <div
              key={deal.id}
              data-testid="vendor-deal-card"
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover-lift animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-xl flex-shrink-0">
                🏷️
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">{deal.title}</h3>
                  <StatusBadge status={deal.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{deal.category.name}</span>
                  <span>₹{deal.discountPrice.toLocaleString()}</span>
                  <span>🔖 {deal._count.bookmarks}</span>
                  <span>⭐ {deal._count.reviews}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/vendor/deals/new?edit=${deal.id}`}
                  data-testid="edit-deal-button"
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors"
                >
                  Edit
                </Link>
                <button
                  data-testid="delete-deal-button"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this deal?')) {
                      deleteDeal.mutate({ id: deal.id });
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
