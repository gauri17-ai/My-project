'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { apiFetch } from '@/lib/api';

interface UserItem {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
}

interface AnalyticsStats {
  total_users: number;
  total_projects: number;
  total_conversations: number;
  total_docs: number;
  ai_failure_count: number;
  ai_average_latency_ms: number;
}

interface KBArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  status: string;
  tags: string[];
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'kb'>('analytics');

  // Stats State
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [fetchingStats, setFetchingStats] = useState(true);

  // Users State
  const [users, setUsers] = useState<UserItem[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userActionId, setUserActionId] = useState<string | null>(null);

  // KB State
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [fetchingArticles, setFetchingArticles] = useState(true);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KBArticle | null>(null);
  
  // KB Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Frontend');
  const [formContent, setFormContent] = useState('');
  const [formStatus, setFormStatus] = useState('published');
  const [formTags, setFormTags] = useState('');
  const [submittingArticle, setSubmittingArticle] = useState(false);

  // Route Protection: Admins only
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [loading, isAuthenticated, user, router]);

  // Fetch Analytics
  const loadAnalytics = async () => {
    setFetchingStats(true);
    try {
      const res = await apiFetch('/api/admin/analytics');
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingStats(false);
    }
  };

  // Fetch Users
  const loadUsers = async () => {
    setFetchingUsers(true);
    try {
      const res = await apiFetch(`/api/admin/users?search=${encodeURIComponent(searchQuery)}`);
      if (res.success && res.data?.items) {
        setUsers(res.data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingUsers(false);
    }
  };

  // Fetch Articles
  const loadArticles = async () => {
    setFetchingArticles(true);
    try {
      const res = await apiFetch('/api/admin/kb');
      if (res.success && res.data) {
        setArticles(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingArticles(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      if (activeTab === 'analytics') loadAnalytics();
      if (activeTab === 'users') loadUsers();
      if (activeTab === 'kb') loadArticles();
    }
  }, [activeTab, isAuthenticated, user]);

  // Suspend / Activate User Toggle
  const handleToggleUserStatus = async (userItem: UserItem) => {
    setUserActionId(userItem.id);
    const action = userItem.status === 'suspended' ? 'activate' : 'suspend';
    try {
      const res = await apiFetch(`/api/admin/users/${userItem.id}/${action}`, {
        method: 'POST'
      });
      if (res.success) {
        setUsers(users.map(u => u.id === userItem.id ? { ...u, status: userItem.status === 'suspended' ? 'active' : 'suspended' } : u));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUserActionId(null);
    }
  };

  // Change Role
  const handleChangeRole = async (userId: string, newRole: string) => {
    setUserActionId(userId);
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        body: JSON.stringify({ role: newRole })
      });
      if (res.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUserActionId(null);
    }
  };

  // Handle Save Article
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContent) return;

    setSubmittingArticle(true);
    const tagsArr = formTags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      let res;
      if (editingArticle) {
        // Edit Mode
        res = await apiFetch(`/api/admin/kb/${editingArticle.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: formTitle,
            category: formCategory,
            content: formContent,
            status: formStatus,
            tags: tagsArr
          })
        });
      } else {
        // Add Mode
        res = await apiFetch('/api/admin/kb', {
          method: 'POST',
          body: JSON.stringify({
            title: formTitle,
            category: formCategory,
            content: formContent,
            status: formStatus,
            tags: tagsArr
          })
        });
      }

      if (res.success) {
        setIsArticleModalOpen(false);
        setEditingArticle(null);
        // Reset inputs
        setFormTitle('');
        setFormContent('');
        setFormTags('');
        loadArticles();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingArticle(false);
    }
  };

  // Open Edit modal
  const openEditArticle = (art: KBArticle) => {
    setEditingArticle(art);
    setFormTitle(art.title);
    setFormCategory(art.category);
    setFormContent(art.content);
    setFormStatus(art.status);
    setFormTags(art.tags.join(', '));
    setIsArticleModalOpen(true);
  };

  // Handle Delete Article
  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge article?')) return;
    try {
      const res = await apiFetch(`/api/admin/kb/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        setArticles(articles.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <span className="h-10 w-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-hidden">
      {/* Background visual glow accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />

      {/* Sidebar Layout */}
      <aside className="w-66 bg-slate-900/40 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between hidden md:flex z-10">
        <div className="p-6 space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-indigo-500/20">
              AI
            </div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              DevMentor
            </span>
          </div>

          <nav className="space-y-1.5">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/30 rounded-xl transition-all"
            >
              📊 Projects Dashboard
            </Link>
            <a 
              href="#" 
              className="flex items-center gap-3 px-4 py-3 text-xs font-semibold text-white bg-slate-800/60 border-l-2 border-indigo-500 rounded-r-xl transition-all shadow-md shadow-indigo-500/5"
            >
              👑 Admin Console
            </a>
          </nav>
        </div>

        <div className="p-5 border-t border-slate-800/80 bg-slate-950/20 flex flex-col gap-1">
          <p className="text-xs font-bold text-slate-200 truncate">{user?.full_name}</p>
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">System Administrator</p>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/10 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <h1 className="text-sm font-bold tracking-wide text-slate-200 uppercase">Administrator Console</h1>
          </div>
          <Link 
            href="/dashboard" 
            className="text-xs bg-slate-900/80 border border-slate-850 hover:border-slate-700 hover:text-white text-slate-300 font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            &larr; Back to Dashboard
          </Link>
        </header>

        {/* Workspace navigation tabs */}
        <div className="border-b border-slate-800/80 bg-slate-950/20 px-6 py-2.5">
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${activeTab === 'analytics' ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-400 shadow-md shadow-indigo-500/5' : 'border-transparent text-slate-450 hover:text-white hover:bg-slate-900/30'}`}
            >
              📊 Analytics Stats
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${activeTab === 'users' ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-400 shadow-md shadow-indigo-500/5' : 'border-transparent text-slate-450 hover:text-white hover:bg-slate-900/30'}`}
            >
              👥 User Management
            </button>
            <button
              onClick={() => setActiveTab('kb')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${activeTab === 'kb' ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-400 shadow-md shadow-indigo-500/5' : 'border-transparent text-slate-450 hover:text-white hover:bg-slate-900/30'}`}
            >
              📚 Knowledge Base
            </button>
          </div>
        </div>

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {fetchingStats ? (
                <div className="h-64 flex items-center justify-center">
                  <span className="h-8 w-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group shadow-lg hover:border-slate-700/80 transition-all">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-violet-500" />
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Registered Users</h3>
                        <p className="text-3xl font-extrabold text-white tracking-tight">{stats.total_users}</p>
                      </div>
                      <span className="text-2xl opacity-80 group-hover:scale-110 transition-all">👥</span>
                    </div>
                  </div>
                  {/* Card 2 */}
                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group shadow-lg hover:border-slate-700/80 transition-all">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 to-purple-500" />
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Projects Planned</h3>
                        <p className="text-3xl font-extrabold text-white tracking-tight">{stats.total_projects}</p>
                      </div>
                      <span className="text-2xl opacity-80 group-hover:scale-110 transition-all">📁</span>
                    </div>
                  </div>
                  {/* Card 3 */}
                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group shadow-lg hover:border-slate-700/80 transition-all">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 to-pink-500" />
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total User Messages</h3>
                        <p className="text-3xl font-extrabold text-white tracking-tight">{stats.total_conversations}</p>
                      </div>
                      <span className="text-2xl opacity-80 group-hover:scale-110 transition-all">💬</span>
                    </div>
                  </div>
                  {/* Card 4 */}
                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group shadow-lg hover:border-slate-700/80 transition-all">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generated Documents</h3>
                        <p className="text-3xl font-extrabold text-white tracking-tight">{stats.total_docs}</p>
                      </div>
                      <span className="text-2xl opacity-80 group-hover:scale-110 transition-all">📄</span>
                    </div>
                  </div>
                  {/* Card 5 */}
                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group shadow-lg hover:border-slate-700/80 transition-all">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-sky-500 to-indigo-500" />
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Avg Latency</h3>
                        <p className="text-3xl font-extrabold text-indigo-400 tracking-tight">{stats.ai_average_latency_ms} <span className="text-xs font-normal text-slate-400">ms</span></p>
                      </div>
                      <span className="text-2xl opacity-80 group-hover:scale-110 transition-all">⚡</span>
                    </div>
                  </div>
                  {/* Card 6 */}
                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group shadow-lg hover:border-slate-700/80 transition-all">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 to-orange-500" />
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Failure Counts</h3>
                        <p className="text-3xl font-extrabold text-red-500 tracking-tight">{stats.ai_failure_count}</p>
                      </div>
                      <span className="text-2xl opacity-80 group-hover:scale-110 transition-all">⚠️</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 border border-dashed border-slate-850 rounded-2xl">Failed to fetch stats.</div>
              )}
            </div>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex items-center gap-3">
                <input 
                  type="text"
                  placeholder="Search user name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 w-80 text-white placeholder:text-slate-600 transition-all"
                />
                <button 
                  onClick={loadUsers}
                  className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-white shadow-md shadow-indigo-600/10"
                >
                  Search
                </button>
              </div>

              {fetchingUsers ? (
                <div className="h-64 flex items-center justify-center">
                  <span className="h-8 w-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950/80 text-slate-450 text-[10px] font-bold uppercase tracking-widest border-b border-slate-800">
                        <tr>
                          <th className="px-6 py-4">Full Name</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Created At</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/80">
                        {users.map(item => (
                          <tr key={item.id} className="hover:bg-slate-850/30 transition-all">
                            <td className="px-6 py-4 font-bold text-slate-200">{item.full_name}</td>
                            <td className="px-6 py-4 text-slate-400">{item.email}</td>
                            <td className="px-6 py-4">
                              <select
                                value={item.role}
                                onChange={(e) => handleChangeRole(item.id, e.target.value)}
                                disabled={userActionId === item.id}
                                className="bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="guest">Guest</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                                item.status === 'active' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                                  : 'bg-red-500/10 text-red-400 border border-red-500/15'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-450">
                              {new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleToggleUserStatus(item)}
                                disabled={userActionId === item.id || item.id === user?.id}
                                className={`text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl border transition-all ${
                                  item.status === 'suspended'
                                    ? 'bg-emerald-600/10 text-emerald-450 border-emerald-500/20 hover:bg-emerald-600 hover:text-white shadow-md shadow-emerald-500/5'
                                    : 'bg-red-650/10 text-red-450 border-red-500/20 hover:bg-red-650 hover:text-white shadow-md shadow-red-500/5'
                                } disabled:opacity-30`}
                              >
                                {item.status === 'suspended' ? 'Activate' : 'Suspend'}
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
          )}

          {/* KB Tab */}
          {activeTab === 'kb' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-900/20 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Knowledge Base Resources</h3>
                  <p className="text-xs text-slate-500 mt-1">Manage mentoring resources, guidelines, and referencing materials.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingArticle(null);
                    setFormTitle('');
                    setFormContent('');
                    setFormTags('');
                    setIsArticleModalOpen(true);
                  }}
                  className="bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/25"
                >
                  + Add Article
                </button>
              </div>

              {fetchingArticles ? (
                <div className="h-64 flex items-center justify-center">
                  <span className="h-8 w-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              ) : articles.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-500 text-sm">
                  No knowledge base articles created yet. Click "+ Add Article" to begin.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.map(art => (
                    <div key={art.id} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700/80 hover:bg-slate-900/60 transition-all shadow-md">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-bold text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/15 tracking-wider">
                            {art.category}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            art.status === 'published' 
                              ? 'bg-emerald-500/15 text-emerald-450 border border-emerald-500/20' 
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {art.status}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-200 mt-3">{art.title}</h4>
                        <p className="text-xs text-slate-450 line-clamp-3 mt-2.5 leading-relaxed font-mono bg-slate-950/40 p-3.5 rounded-xl border border-slate-850/50">
                          {art.content}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-850/80">
                        <div className="flex flex-wrap gap-1">
                          {art.tags.map((t, idx) => (
                            <span key={idx} className="text-[9px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850/50">
                              #{t}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditArticle(art)}
                            className="text-[10px] font-bold uppercase text-slate-450 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(art.id)}
                            className="text-[10px] font-bold uppercase text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-slate-800 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Article Form Modal */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-violet-500" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              {editingArticle ? '🔧 Edit Article' : '✨ Create KB Article'}
            </h3>
            
            <form onSubmit={handleSaveArticle} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Title</label>
                <input 
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="e.g. Next.js Routing Reference"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Product">Product</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Tags (comma-separated)</label>
                <input 
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="react, router, seo"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Content</label>
                <textarea 
                  required
                  rows={5}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono leading-relaxed transition-all"
                  placeholder="Markdown or standard article content reference here..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-350 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submittingArticle}
                  className="px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white bg-indigo-650 hover:bg-indigo-600 transition-all disabled:opacity-50 shadow-md shadow-indigo-650/15"
                >
                  {submittingArticle ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
