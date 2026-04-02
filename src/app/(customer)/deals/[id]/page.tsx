'use client';

import { useParams } from 'next/navigation';
import { useTRPC } from '@/app/trpc/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/Toast';
import { StatusBadge } from '@/components/EmptyState';
import { use } from 'react';

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const trpc = useTRPC();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: deal, isLoading } = useQuery(trpc.deals.getById.queryOptions({ id }));
  const { data: isBookmarked } = useQuery(trpc.bookmarks.isBookmarked.queryOptions({ dealId: id }));

  const addBookmark = useMutation(
    trpc.bookmarks.add.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.bookmarks.isBookmarked.queryOptions({ dealId: id }).queryKey });
        addToast('Deal bookmarked!', 'success');
      },
      onError: (err) => addToast(err.message, 'error'),
    })
  );

  const removeBookmark = useMutation(
    trpc.bookmarks.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.bookmarks.isBookmarked.queryOptions({ dealId: id }).queryKey });
        addToast('Bookmark removed', 'info');
      },
    })
  );

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard!', 'success');
    } catch {
      addToast('Failed to copy link', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-shimmer h-8 w-2/3 rounded mb-4" />
        <div className="animate-shimmer h-4 w-1/3 rounded mb-8" />
        <div className="animate-shimmer h-64 rounded-2xl" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <span className="text-6xl mb-4 block">🔍</span>
        <h2 className="text-xl font-semibold">Deal not found</h2>
      </div>
    );
  }

  const discount = Math.round(((deal.originalPrice - deal.discountPrice) / deal.originalPrice) * 100);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in" data-testid="deal-detail-page">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            {deal.category.name}
          </span>
          <StatusBadge status={deal.status} />
          {deal.store && (
            <span className="text-xs text-muted-foreground">via {deal.store.name}</span>
          )}
        </div>
        <h1 className="text-3xl font-bold mb-2">{deal.title}</h1>
        <p className="text-muted-foreground text-sm">
          Posted by {deal.vendor.user.username} • {deal._count.bookmarks} bookmarks • {deal._count.reviews} reviews
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 mb-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Deal visual */}
          <div className="lg:w-1/3">
            <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <span className="text-7xl">🏷️</span>
              <div className="absolute top-3 right-3 gradient-bg text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                {discount}% OFF
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-foreground leading-relaxed">{deal.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Original Price</h3>
                <p className="text-lg text-muted-foreground line-through">₹{deal.originalPrice.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Discounted Price</h3>
                <p className="text-2xl font-bold text-primary">₹{deal.discountPrice.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">You Save</h3>
                <p className="text-lg font-semibold text-success">₹{(deal.originalPrice - deal.discountPrice).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Expires</h3>
                <p className="text-lg">{new Date(deal.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
              <button
                data-testid="bookmark-button"
                onClick={() => {
                  if (isBookmarked) removeBookmark.mutate({ dealId: id });
                  else addBookmark.mutate({ dealId: id });
                }}
                disabled={addBookmark.isPending || removeBookmark.isPending}
                className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isBookmarked
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'border border-border hover:bg-accent'
                }`}
              >
                {isBookmarked ? '🔖 Bookmarked' : '🔖 Bookmark'}
              </button>

              <button
                data-testid="share-button"
                onClick={handleShare}
                className="px-5 py-2.5 rounded-xl border border-border font-medium text-sm hover:bg-accent transition-colors"
              >
                📤 Share
              </button>

              <a
                href={deal.dealUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="visit-website-button"
                className="px-5 py-2.5 rounded-xl gradient-bg text-white font-medium text-sm shadow-lg hover:opacity-90 transition-opacity"
              >
                Visit Website →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Reviews ({deal.reviews.length})</h2>
        {deal.reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review this deal!</p>
        ) : (
          <div className="space-y-4">
            {deal.reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-xl bg-muted/50 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{review.user.username}</span>
                  <span className="text-yellow-500 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
