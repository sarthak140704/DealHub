'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTRPC } from '@/app/trpc/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/Toast';

export default function NewDealPage() {
  const router = useRouter();
  const trpc = useTRPC();
  const { addToast } = useToast();

  const { data: categories } = useQuery(trpc.categories.getAll.queryOptions());

  const [form, setForm] = useState({
    title: '',
    description: '',
    originalPrice: '',
    discountPrice: '',
    dealUrl: '',
    imageUrl: '',
    expiryDate: '',
    categoryId: '',
  });

  const createDeal = useMutation(
    trpc.deals.create.mutationOptions({
      onSuccess: () => {
        addToast('Deal submitted for approval!', 'success');
        router.push('/vendor/deals');
      },
      onError: (err) => addToast(err.message, 'error'),
    })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDeal.mutate({
      title: form.title,
      description: form.description,
      originalPrice: parseFloat(form.originalPrice),
      discountPrice: parseFloat(form.discountPrice),
      dealUrl: form.dealUrl,
      imageUrl: form.imageUrl || undefined,
      expiryDate: form.expiryDate,
      categoryId: form.categoryId,
    });
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="max-w-2xl mx-auto" data-testid="new-deal-page">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Submit New Deal</h1>
        <p className="text-muted-foreground">Your deal will be reviewed before going live</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5 animate-fade-in">
        <div>
          <label className="block text-sm font-medium mb-1.5">Deal Title</label>
          <input
            type="text"
            data-testid="deal-title-input"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g., iPhone 16 — 20% Off"
            required
            minLength={3}
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            data-testid="deal-description-input"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Describe the deal in detail..."
            required
            minLength={10}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Original Price (₹)</label>
            <input
              type="number"
              data-testid="deal-price-input"
              value={form.originalPrice}
              onChange={(e) => update('originalPrice', e.target.value)}
              placeholder="0.00"
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Discounted Price (₹)</label>
            <input
              type="number"
              data-testid="deal-discount-price-input"
              value={form.discountPrice}
              onChange={(e) => update('discountPrice', e.target.value)}
              placeholder="0.00"
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Deal URL</label>
          <input
            type="url"
            data-testid="deal-url-input"
            value={form.dealUrl}
            onChange={(e) => update('dealUrl', e.target.value)}
            placeholder="https://example.com/deal"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Image URL <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input
            type="url"
            data-testid="deal-image-input"
            value={form.imageUrl}
            onChange={(e) => update('imageUrl', e.target.value)}
            placeholder="https://example.com/product.jpg"
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Expiry Date</label>
            <input
              type="date"
              data-testid="deal-expiry-input"
              value={form.expiryDate}
              onChange={(e) => update('expiryDate', e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Category</label>
            <select
              data-testid="deal-category-select"
              value={form.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview discount */}
        {form.originalPrice && form.discountPrice && (
          <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-medium animate-fade-in">
            💰 Discount: {Math.round(((parseFloat(form.originalPrice) - parseFloat(form.discountPrice)) / parseFloat(form.originalPrice)) * 100)}% off — Customers save ₹{(parseFloat(form.originalPrice) - parseFloat(form.discountPrice)).toLocaleString()}
          </div>
        )}

        <button
          type="submit"
          data-testid="submit-deal-form-button"
          disabled={createDeal.isPending}
          className="w-full py-3 rounded-xl gradient-bg text-white font-semibold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {createDeal.isPending ? 'Submitting...' : 'Submit Deal for Approval'}
        </button>
      </form>
    </div>
  );
}
