'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { apiFetch } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, logout, isAuthenticated, updateUserData } = useAuth() as any;

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPreferredLanguage(user.preferred_language || 'en');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: fullName,
          preferred_language: preferredLanguage
        })
      });

      if (res.success) {
        setProfileMessage({ type: 'success', text: 'Profile details updated successfully.' });
        if (updateUserData) {
          updateUserData({
            ...user,
            full_name: fullName,
            preferred_language: preferredLanguage
          });
        }
      } else {
        setProfileMessage({ type: 'error', text: res.error?.message || 'Failed to update profile.' });
      }
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.error?.message || 'An error occurred. Please try again.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setSavingPassword(true);

    try {
      const res = await apiFetch('/api/auth/profile/password', {
        method: 'PUT',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      if (res.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage({ type: 'error', text: res.error?.message || 'Failed to change password.' });
      }
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.error?.message || 'An error occurred. Please try again.' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <span className="h-10 w-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
        <div className="p-6 space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-base shadow-md shadow-indigo-500/10">
              AI
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              DevMentor
            </span>
          </div>

          <nav className="space-y-1.5">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-lg transition-all"
            >
              📊 Projects Dashboard
            </Link>
            {user?.role === 'admin' && (
              <Link 
                href="/admin" 
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-lg transition-all"
              >
                👑 Admin Console
              </Link>
            )}
            <a 
              href="#" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-slate-800/80 border-l-2 border-indigo-500 rounded-r-lg transition-all"
            >
              ⚙️ Settings
            </a>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-200 truncate">{user?.full_name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
            title="Log Out"
          >
            🚪
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800 bg-slate-900/30 backdrop-blur-md px-6 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-200">Account Settings</h1>
          <Link 
            href="/dashboard" 
            className="text-xs bg-slate-900 border border-slate-800 hover:text-white text-slate-400 font-semibold px-4 py-2 rounded-xl transition-all"
          >
            &larr; Back to Dashboard
          </Link>
        </header>

        <main className="flex-1 p-8 overflow-y-auto max-w-4xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Profile Form */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-extrabold text-white">Profile Details</h2>
                <p className="text-xs text-slate-400 mt-1">Manage your full name and language settings.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Email Address</label>
                  <input 
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Full Name</label>
                  <input 
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Preferred Language</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="mr">Marathi (मराठी)</option>
                    <option value="hinglish">Hinglish (Hindi + English)</option>
                    <option value="maranglish">Maranglish (Marathi + English)</option>
                  </select>
                </div>

                {profileMessage && (
                  <p className={`text-xs font-semibold p-3 rounded-lg ${
                    profileMessage.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/15'
                  }`}>
                    {profileMessage.text}
                  </p>
                )}

                <button 
                  type="submit"
                  disabled={savingProfile}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Profile Details'}
                </button>
              </form>
            </section>

            {/* Password Form */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-extrabold text-white">Change Password</h2>
                <p className="text-xs text-slate-400 mt-1">Keep your account secure with a strong password.</p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Current Password</label>
                  <input 
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">New Password</label>
                  <input 
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Confirm New Password</label>
                  <input 
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                  />
                </div>

                {passwordMessage && (
                  <p className={`text-xs font-semibold p-3 rounded-lg ${
                    passwordMessage.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/15'
                  }`}>
                    {passwordMessage.text}
                  </p>
                )}

                <button 
                  type="submit"
                  disabled={savingPassword}
                  className="w-full bg-indigo-650 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
                >
                  {savingPassword ? 'Updating Password...' : 'Change Password'}
                </button>
              </form>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
