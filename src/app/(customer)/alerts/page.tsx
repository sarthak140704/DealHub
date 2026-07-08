'use client';

import { useState } from 'react';
import { useTRPC } from '@/app/trpc/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/Toast';
import { EmptyState } from '@/components/EmptyState';

export default function AlertsPage() {
  const trpc = useTRPC();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [categoryId, setCategoryId] = useState('');
  const [keyword, setKeyword] = useState('');

  const { data: categories } = useQuery(trpc.categories.getAll.queryOptions());
  const { data: alerts, isLoading } = useQuery(trpc.alerts.list.queryOptions());

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: trpc.alerts.list.queryOptions().queryKey });

  const createAlert = useMutation(
    trpc.alerts.create.mutationOptions({
      onSuccess: () => {
        invalidate();
        setCategoryId('');
        setKeyword('');
        addToast('Alert created — we\u2019ll notify you about matching deals', 'success');
      },
      onError: (err) => addToast(err.message, 'error'),
    })
  );

  const deleteAlert = useMutation(
    trpc.alerts.delete.mutationOptions({
      onSuccess: () => {
        invalidate();
        addToast('Alert removed', 'info');
      },
      onError: (err) => addToast(err.message, 'error'),
    })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId && !keyword.trim()) {
      addToast('Pick a category or enter a keyword', 'error');
      return;
    }
    createAlert.mutate({
      categoryId: categoryId || undefined,
      keyword: keyword.trim() || undefined,
    });
  };

  return (
    <div className="max-w-3xl mx-auto" data-testid="alerts-page">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Deal Alerts</h1>
        <p className="text-muted-foreground">
          Get notified when new deals match a category or keyword you care about.
        </p>
      </div>

      {/* Create alert */}
      <form
        onSubmit={handleSubmit}
        data-testid="alert-form"
        className="bg-card border border-border rounded-2xl p-6 mb-8 space-y-4 animate-fade-in"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Category <span className="text-muted-foreground font-normal">(optional)</span></label>
            <select
              data-testid="alert-category-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Any category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Keyword <span className="text-muted-foreground font-normal">(optional)</span></label>
            <input
              type="text"
              data-testid="alert-keyword-input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., iphone, headphones"
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <button
          type="submit"
          data-testid="create-alert-button"
          disabled={createAlert.isPending}
          className="px-5 py-2.5 rounded-xl gradient-bg text-white font-medium text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {createAlert.isPending ? 'Creating…' : 'Create Alert'}
        </button>
      </form>

      {/* Existing alerts */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : !alerts || alerts.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No Alerts Yet"
          description="Create an alert above to get notified about new matching deals."
        />
      ) : (
        <div className="space-y-3 animate-fade-in">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              data-testid="alert-item"
              className="flex items-center justify-between gap-4 bg-card border border-border rounded-xl p-4"
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {alert.category && (
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {alert.category.name}
                  </span>
                )}
                {alert.keyword && (
                  <span className="px-2.5 py-1 rounded-full bg-muted text-foreground font-medium">
                    “{alert.keyword}”
                  </span>
                )}
              </div>
              <button
                data-testid="delete-alert-button"
                onClick={() => deleteAlert.mutate({ id: alert.id })}
                disabled={deleteAlert.isPending}
                className="shrink-0 px-3 py-1.5 rounded-lg text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
