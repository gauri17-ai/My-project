'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      if (res.success) {
        setMessage({
          type: 'success',
          text: 'If the email exists in our system, a password reset link has been sent to it. Please check your inbox.'
        });
      } else {
        setMessage({
          type: 'error',
          text: res.error?.message || 'Failed to request password reset.'
        });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.error?.message || 'An error occurred. Please try again later.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-indigo-500/10 items-center justify-center text-xl font-bold text-indigo-400">
            🔑
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Forgot Password?</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase">Email Address</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={submitting}
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
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-505 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/10"
          >
            {submitting ? 'Sending Link...' : 'Send Reset Link'}
          </button>
        </form>

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
