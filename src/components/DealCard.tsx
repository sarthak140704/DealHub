'use client';

import Link from 'next/link';
import { useState } from 'react';

interface DealCardProps {
  id: string;
  title: string;
  originalPrice: number;
  discountPrice: number;
  category: { name: string; slug: string };
  vendor?: { user: { username: string } } | null;
  store?: { name: string } | null;
  imageUrl?: string | null;
  expiryDate: string | Date;
  bookmarkCount?: number;
  index?: number;
}

export function DealCard({
  id,
  title,
  originalPrice,
  discountPrice,
  category,
  store,
  imageUrl,
  expiryDate,
  bookmarkCount = 0,
  index = 0,
}: DealCardProps) {
  const [now] = useState(() => Date.now());
  const discount = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  const expiry = new Date(expiryDate);
  const isExpiringSoon = expiry.getTime() - now < 3 * 24 * 60 * 60 * 1000;

  return (
    <Link href={`/deals/${id}`} data-testid="deal-card">
      <div
        className="group bg-card border border-border rounded-2xl overflow-hidden hover-lift animate-fade-in"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        {/* Discount badge */}
        <div className="relative p-4 pb-0">
          <div className="absolute top-4 right-4 gradient-bg text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            {discount}% OFF
          </div>
          <div className="h-32 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
            ) : (
              <span className="text-5xl opacity-60">🏷️</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {category.name}
            </span>
            {store && (
              <span className="text-xs text-muted-foreground">
                via {store.name}
              </span>
            )}
          </div>

          <h3 className="font-semibold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">₹{discountPrice.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground line-through">₹{originalPrice.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
            <span className={isExpiringSoon ? 'text-destructive font-medium' : ''}>
              {isExpiringSoon ? '⚠️ ' : ''}
              Expires {expiry.toLocaleDateString()}
            </span>
            <span>🔖 {bookmarkCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function DealCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden" data-testid="deal-card-skeleton">
      <div className="p-4 pb-0">
        <div className="h-32 rounded-xl animate-shimmer" />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded-full animate-shimmer" />
          <div className="h-5 w-16 rounded-full animate-shimmer" />
        </div>
        <div className="h-5 w-3/4 rounded animate-shimmer" />
        <div className="h-5 w-1/2 rounded animate-shimmer" />
        <div className="flex justify-between pt-1 border-t border-border">
          <div className="h-4 w-24 rounded animate-shimmer" />
          <div className="h-4 w-8 rounded animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
