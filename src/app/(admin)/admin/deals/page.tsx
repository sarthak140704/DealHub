'use client';

import { useTRPC } from '@/app/trpc/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatusBadge } from '@/components/EmptyState';
import { useToast } from '@/components/Toast';

export default function AdminDealsPage() {
  const trpc = useTRPC();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(trpc.deals.getAllAdmin.queryOptions());

  const approveDeal = useMutation(
    trpc.deals.approve.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.deals.getAllAdmin.queryOptions().queryKey });
        addToast('Deal approved!', 'success');
      },
      onError: (err) => addToast(err.message, 'error'),
    })
  );

  const rejectDeal = useMutation(
    trpc.deals.reject.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.deals.getAllAdmin.queryOptions().queryKey });
        addToast('Deal rejected', 'info');
      },
      onError: (err) => addToast(err.message, 'error'),
    })
  );

  return (
    <div className="max-w-6xl mx-auto" data-testid="admin-deals-page">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Manage Deals</h1>
        <p className="text-muted-foreground">Review, approve, or reject submitted deals</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Deal</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Vendor</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.deals.map((deal, i) => (
                  <tr
                    key={deal.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="p-4 text-sm font-medium max-w-[250px] truncate">{deal.title}</td>
                    <td className="p-4 text-sm text-muted-foreground">{deal.vendor.user.username}</td>
                    <td className="p-4 text-sm text-muted-foreground">{deal.category.name}</td>
                    <td className="p-4 text-center text-sm">₹{deal.discountPrice.toLocaleString()}</td>
                    <td className="p-4 text-center"><StatusBadge status={deal.status} /></td>
                    <td className="p-4 text-center">
                      {deal.status === 'PENDING_APPROVAL' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            data-testid="approve-deal-button"
                            onClick={() => approveDeal.mutate({ id: deal.id })}
                            disabled={approveDeal.isPending}
                            className="px-3 py-1.5 rounded-lg bg-success text-success-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                          >
                            Approve
                          </button>
                          <button
                            data-testid="reject-deal-button"
                            onClick={() => rejectDeal.mutate({ id: deal.id })}
                            disabled={rejectDeal.isPending}
                            className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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
