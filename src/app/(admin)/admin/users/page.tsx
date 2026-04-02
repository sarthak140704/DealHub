'use client';

import { useTRPC } from '@/app/trpc/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/Toast';

export default function AdminUsersPage() {
  const trpc = useTRPC();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(trpc.users.getAll.queryOptions());

  const updateRole = useMutation(
    trpc.users.updateRole.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.users.getAll.queryOptions().queryKey });
        addToast('Role updated', 'success');
      },
      onError: (err) => addToast(err.message, 'error'),
    })
  );

  const deleteUser = useMutation(
    trpc.users.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.users.getAll.queryOptions().queryKey });
        addToast('User deleted', 'success');
      },
      onError: (err) => addToast(err.message, 'error'),
    })
  );

  return (
    <div className="max-w-6xl mx-auto" data-testid="admin-users-page">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
        <p className="text-muted-foreground">View, modify roles, and manage user accounts</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Username</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.users.map((user, i) => (
                  <tr
                    key={user.id}
                    data-testid="user-row"
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="p-4 text-sm font-medium">{user.username}</td>
                    <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="p-4 text-center">
                      <select
                        data-testid="change-role-select"
                        value={user.role}
                        onChange={(e) =>
                          updateRole.mutate({
                            userId: user.id,
                            role: e.target.value as 'CUSTOMER' | 'VENDOR' | 'ADMIN',
                          })
                        }
                        className="px-2 py-1 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="VENDOR">Vendor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="p-4 text-center text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        data-testid="delete-user-button"
                        onClick={() => {
                          if (confirm(`Delete user ${user.username}? This cannot be undone.`)) {
                            deleteUser.mutate({ userId: user.id });
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors"
                      >
                        Delete
                      </button>
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
