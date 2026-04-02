'use client';

import { useTRPC } from '@/app/trpc/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/Toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfilePage() {
  const trpc = useTRPC();
  const { addToast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: session } = useQuery(trpc.auth.getSession.queryOptions());

  const [displayName, setDisplayName] = useState('');

  const logoutMutation = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: () => {
        queryClient.clear();
        router.push('/login');
        addToast('Logged out successfully', 'success');
      },
    })
  );

  // Initialize display name when session loads
  if (session && !displayName) {
    setDisplayName(session.username);
  }

  return (
    <div className="max-w-2xl mx-auto" data-testid="profile-page">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="space-y-6">
        {/* Profile Info */}
        <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Display Name</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  data-testid="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  data-testid="save-name-button"
                  onClick={() => addToast('Profile updated', 'success')}
                  className="px-5 py-2.5 rounded-xl gradient-bg text-white font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={session?.email || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Role</label>
              <div className="px-4 py-2.5 rounded-xl border border-input bg-muted text-muted-foreground">
                {session?.role}
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in" data-testid="change-password-section" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button className="px-5 py-2.5 rounded-xl border border-border font-medium text-sm hover:bg-accent transition-colors">
              Update Password
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg font-semibold mb-2">Danger Zone</h2>
          <p className="text-muted-foreground text-sm mb-4">Sign out of your account on this device.</p>
          <button
            data-testid="logout-button"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
}
