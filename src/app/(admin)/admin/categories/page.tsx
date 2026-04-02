'use client';

import { useState } from 'react';
import { useTRPC } from '@/app/trpc/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/Toast';

export default function AdminCategoriesPage() {
  const trpc = useTRPC();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery(trpc.categories.getAll.queryOptions());

  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');

  const createCategory = useMutation(
    trpc.categories.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.categories.getAll.queryOptions().queryKey });
        setNewName('');
        setNewSlug('');
        addToast('Category created', 'success');
      },
      onError: (err) => addToast(err.message, 'error'),
    })
  );

  const updateCategory = useMutation(
    trpc.categories.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.categories.getAll.queryOptions().queryKey });
        setEditingId(null);
        addToast('Category updated', 'success');
      },
      onError: (err) => addToast(err.message, 'error'),
    })
  );

  const deleteCategory = useMutation(
    trpc.categories.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.categories.getAll.queryOptions().queryKey });
        addToast('Category deleted', 'success');
      },
      onError: (err) => addToast(err.message, 'error'),
    })
  );

  const handleNameChange = (value: string) => {
    setNewName(value);
    setNewSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  };

  return (
    <div className="max-w-3xl mx-auto" data-testid="admin-categories-page">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Categories</h1>
        <p className="text-muted-foreground">Manage deal categories</p>
      </div>

      {/* Add new */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6 animate-fade-in">
        <h2 className="text-sm font-semibold mb-3">Add New Category</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createCategory.mutate({ name: newName, slug: newSlug });
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            data-testid="category-name-input"
            value={newName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Category name"
            required
            className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="text"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="slug"
            required
            className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            data-testid="add-category-button"
            disabled={createCategory.isPending}
            className="px-5 py-2.5 rounded-xl gradient-bg text-white font-medium text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {createCategory.isPending ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {categories?.map((cat, i) => (
            <div
              key={cat.id}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl animate-fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {editingId === cat.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="text"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    data-testid="save-category-button"
                    onClick={() => updateCategory.mutate({ id: cat.id, name: editName, slug: editSlug })}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <span className="font-medium text-sm">{cat.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">/{cat.slug}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{cat._count.deals} deals</span>
                  <button
                    onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditSlug(cat.slug); }}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${cat.name}"?`)) deleteCategory.mutate({ id: cat.id });
                    }}
                    className="px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
