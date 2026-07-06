'use client';

import { useTRPC } from '@/app/trpc/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DealCard, DealCardSkeleton } from '@/components/DealCard';
import { EmptyState } from '@/components/EmptyState';
import { useToast } from '@/components/Toast';

export default function BookmarksPage() {
  const trpc = useTRPC();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookmarks, isLoading } = useQuery(trpc.bookmarks.getByUser.queryOptions());

  const removeBookmark = useMutation(
    trpc.bookmarks.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.bookmarks.getByUser.queryOptions().queryKey });
        addToast('Bookmark removed', 'info');
      },
    })
  );

  return (
    <div className="max-w-7xl mx-auto" data-testid="bookmarks-page">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">My Bookmarks</h1>
        <p className="text-muted-foreground">Your saved deals in one place</p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <DealCardSkeleton key={i} />
          ))}
        </div>
      ) : !bookmarks || bookmarks.length === 0 ? (
        <EmptyState
          icon="🔖"
          title="No Bookmarks Yet"
          description="Start browsing deals and bookmark the ones you love!"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark, i) => (
            <div key={bookmark.id} className="relative" data-testid="bookmarked-deal-card">
              <DealCard
                id={bookmark.deal.id}
                title={bookmark.deal.title}
                originalPrice={bookmark.deal.originalPrice}
                discountPrice={bookmark.deal.discountPrice}
                category={bookmark.deal.category}
                vendor={bookmark.deal.vendor}
                store={bookmark.deal.store}
                imageUrl={bookmark.deal.imageUrl}
                expiryDate={bookmark.deal.expiryDate}
                bookmarkCount={bookmark.deal._count.bookmarks}
                index={i}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeBookmark.mutate({ dealId: bookmark.deal.id });
                }}
                className="absolute top-6 right-6 z-10 w-8 h-8 rounded-full bg-destructive/90 text-white flex items-center justify-center text-xs hover:bg-destructive transition-colors shadow-md"
                title="Remove bookmark"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
