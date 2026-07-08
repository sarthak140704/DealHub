'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { useTRPC } from '@/app/trpc/client';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from './Toast';

interface NavItem {
  label: string;
  href: string;
  testId: string;
  icon: string;
}

const customerNav: NavItem[] = [
  { label: 'Dashboard', href: '/home', testId: 'nav-dashboard', icon: '🏠' },
  { label: 'Browse Deals', href: '/deals', testId: 'nav-deals', icon: '🏷️' },
  { label: 'Bookmarks', href: '/bookmarks', testId: 'nav-bookmarks', icon: '🔖' },
  { label: 'Alerts', href: '/alerts', testId: 'nav-alerts', icon: '🔔' },
  { label: 'Notifications', href: '/notifications', testId: 'nav-notifications', icon: '📬' },
  { label: 'Profile', href: '/profile', testId: 'nav-profile', icon: '👤' },
];

const vendorNav: NavItem[] = [
  { label: 'Dashboard', href: '/vendor/dashboard', testId: 'nav-dashboard', icon: '📊' },
  { label: 'My Deals', href: '/vendor/deals', testId: 'nav-deals', icon: '🏷️' },
  { label: 'Submit Deal', href: '/vendor/deals/new', testId: 'nav-submit-deal', icon: '➕' },
  { label: 'Analytics', href: '/vendor/analytics', testId: 'nav-analytics', icon: '📈' },
  { label: 'Profile', href: '/profile', testId: 'nav-profile', icon: '👤' },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', testId: 'nav-dashboard', icon: '📊' },
  { label: 'Manage Deals', href: '/admin/deals', testId: 'nav-deals', icon: '🏷️' },
  { label: 'Manage Users', href: '/admin/users', testId: 'nav-users', icon: '👥' },
  { label: 'Categories', href: '/admin/categories', testId: 'nav-categories', icon: '📁' },
  { label: 'Logs', href: '/admin/logs', testId: 'nav-logs', icon: '📋' },
];

export function Sidebar({ role }: { role: 'CUSTOMER' | 'VENDOR' | 'ADMIN' }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: () => {
        queryClient.clear();
        router.push('/login');
        addToast('Logged out successfully', 'success');
      },
    })
  );

  const navItems = role === 'ADMIN' ? adminNav : role === 'VENDOR' ? vendorNav : customerNav;

  return (
    <>
      {/* Mobile hamburger */}
      <button
        data-testid="mobile-menu-button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {mobileOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        data-testid="sidebar"
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-sidebar-bg border-r border-sidebar-border flex flex-col z-40 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3" data-testid="brand-logo">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-lg shadow-lg">
              D
            </div>
            <span className="text-xl font-bold gradient-text">DealHub</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={item.testId}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-sidebar-active text-primary shadow-sm'
                    : 'text-sidebar-text hover:bg-accent hover:text-foreground'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          {/* Theme toggle */}
          <button
            data-testid="theme-toggle"
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-text hover:bg-accent hover:text-foreground transition-all duration-200"
          >
            <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Logout */}
          <button
            data-testid="logout-button"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <span className="text-lg">🚪</span>
            <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
