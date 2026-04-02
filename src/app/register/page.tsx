'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTRPC } from '@/app/trpc/client';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/Toast';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'VENDOR'>('CUSTOMER');
  const [companyName, setCompanyName] = useState('');
  const router = useRouter();
  const trpc = useTRPC();
  const { addToast } = useToast();

  const registerMutation = useMutation(
    trpc.auth.register.mutationOptions({
      onSuccess: (data) => {
        addToast(`Welcome to DealHub, ${data.username}!`, 'success');
        if (data.role === 'VENDOR') router.push('/vendor/dashboard');
        else router.push('/home');
      },
      onError: (error) => {
        addToast(error.message, 'error');
      },
    })
  );


  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" data-testid="register-page">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-xl shadow-lg">
              D
            </div>
            <span className="text-2xl font-bold gradient-text">DealHub</span>
          </Link>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm mt-1">Start discovering amazing deals</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              registerMutation.mutate({
                username,
                email,
                password,
                role,
                companyName: role === 'VENDOR' ? companyName : undefined,
              });
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1.5">Username</label>
              <input
                id="username"
                type="text"
                data-testid="username-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                required
                minLength={3}
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                data-testid="email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                data-testid="password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-1.5">I am a</label>
              <select
                id="role"
                data-testid="role-select"
                value={role}
                onChange={(e) => setRole(e.target.value as 'CUSTOMER' | 'VENDOR')}
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              >
                <option value="CUSTOMER">Customer — I want to find deals</option>
                <option value="VENDOR">Vendor — I want to post deals</option>
              </select>
            </div>

            {role === 'VENDOR' && (
              <div className="animate-fade-in">
                <label htmlFor="companyName" className="block text-sm font-medium mb-1.5">Company Name</label>
                <input
                  id="companyName"
                  type="text"
                  data-testid="company-name-input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
            )}

            <button
              type="submit"
              data-testid="register-button"
              disabled={registerMutation.isPending}
              className="w-full py-2.5 rounded-xl gradient-bg text-white font-semibold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
