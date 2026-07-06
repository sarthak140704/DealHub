'use client';

import { useState } from 'react';
import { useTRPC } from '@/app/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { DealCard, DealCardSkeleton } from '@/components/DealCard';
import { EmptyState } from '@/components/EmptyState';

export default function DealsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'newest' | 'popular' | 'discount' | 'price_asc'>('newest');
  const [page, setPage] = useState(1);

  const trpc = useTRPC();

  const { data: categories } = useQuery(trpc.categories.getAll.queryOptions());

  const { data, isLoading } = useQuery(
    trpc.deals.getAll.queryOptions({
      q: search || undefined,
      category: category || undefined,
      sort,
      page,
      limit: 12,
    })
  );

  return (
    <div className="max-w-7xl mx-auto" data-testid="deals-page">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Browse Deals</h1>
        <p className="text-muted-foreground">Find the best offers across all categories</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
          <input
            type="text"
            data-testid="search-input"
            placeholder="Search deals..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
        </div>

        <select
          data-testid="category-filter"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Categories</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>

        <select
          data-testid="sort-dropdown"
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
          <option value="discount">Highest Discount</option>
          <option value="price_asc">Price: Low to High</option>
        </select>
      </div>

      {/* Deals Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <DealCardSkeleton key={i} />
          ))}
        </div>
      ) : data?.deals.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No Deals Found"
          description="Try adjusting your search or filters to find what you're looking for."
          testId="no-deals-message"
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.deals.map((deal, i) => (
              <DealCard
                key={deal.id}
                id={deal.id}
                title={deal.title}
                originalPrice={deal.originalPrice}
                discountPrice={deal.discountPrice}
                category={deal.category}
                vendor={deal.vendor}
                store={deal.store}
                imageUrl={deal.imageUrl}
                expiryDate={deal.expiryDate}
                bookmarkCount={deal._count.bookmarks}
                index={i}
              />
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground px-3">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
