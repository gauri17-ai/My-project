'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setMessage({ type: 'error', text: 'Reset token is missing from URL.' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password })
      });

      if (res.success) {
        setMessage({
          type: 'success',
          text: 'Your password has been reset successfully. Redirecting you to login...'
        });
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: res.error?.message || 'Failed to reset password.'
        });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.error?.message || 'An error occurred. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!token && (
        <p className="text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/15 p-3 rounded-lg">
          Invalid password reset link. A token must be present in the URL parameter.
        </p>
      )}

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase">New Password</label>
        <input 
          type="password"
          required
          disabled={!token || submitting}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-slate-700 disabled:opacity-50"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase">Confirm New Password</label>
        <input 
          type="password"
          required
          disabled={!token || submitting}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-slate-700 disabled:opacity-50"
        />
      </div>

      {message && (
        <p className={`text-xs font-semibold p-3 rounded-lg leading-relaxed ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
            : 'bg-red-500/10 text-red-400 border border-red-500/15'
        }`}>
          {message.text}
        </p>
      )}

      <button 
        type="submit"
        disabled={!token || submitting}
        className="w-full bg-indigo-650 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all"
      >
        {submitting ? 'Resetting Password...' : 'Reset Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-indigo-500/10 items-center justify-center text-xl font-bold text-indigo-400">
            🔒
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Enter your new secure password below to regain access to your account.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex justify-center p-4">
            <span className="h-6 w-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

        <div className="text-center pt-2 border-t border-slate-850">
          <Link 
            href="/login"
            className="text-xs font-bold text-slate-450 hover:text-white transition-colors"
          >
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
