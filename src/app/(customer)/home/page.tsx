'use client';

import Link from 'next/link';
import { useTRPC } from '@/app/trpc/client';
import { useQuery } from '@tanstack/react-query';

export default function HomePage() {
  const trpc = useTRPC();
  const { data: session } = useQuery(trpc.auth.getSession.queryOptions());

  return (
    <div className="max-w-4xl mx-auto" data-testid="home-page">
      {/* Welcome Section */}
      <div className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2" data-testid="welcome-message">
          Welcome back, <span className="gradient-text">{session?.username || 'User'}</span> 👋
        </h1>
        <p className="text-muted-foreground">
          Ready to discover today&apos;s best deals?
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/deals" data-testid="browse-deals-card">
          <div className="group p-8 rounded-2xl bg-card border border-border hover-lift cursor-pointer animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:scale-110 transition-transform">
              🏷️
            </div>
            <h2 className="text-xl font-semibold mb-2">Browse Deals</h2>
            <p className="text-muted-foreground text-sm">
              Explore thousands of curated deals across electronics, fashion, food, travel, and more.
            </p>
            <div className="mt-4 text-primary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              Explore deals <span>→</span>
            </div>
          </div>
        </Link>

        <Link href="/bookmarks" data-testid="bookmarks-card">
          <div className="group p-8 rounded-2xl bg-card border border-border hover-lift cursor-pointer animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:scale-110 transition-transform">
              🔖
            </div>
            <h2 className="text-xl font-semibold mb-2">My Bookmarks</h2>
            <p className="text-muted-foreground text-sm">
              View and manage your saved deals. Never lose track of an offer that caught your eye.
            </p>
            <div className="mt-4 text-secondary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              View bookmarks <span>→</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
