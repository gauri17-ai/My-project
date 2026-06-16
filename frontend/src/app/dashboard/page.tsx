'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { apiFetch } from '@/lib/api';
import NewProjectModal from '@/components/project/NewProjectModal';

interface Project {
  id: string;
  project_name: string;
  project_type: string;
  category: string | null;
  description: string;
  status: string;
  requirement_completion_percentage: number;
  updated_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [fetchingProjects, setFetchingProjects] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Confirmation state
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Route protection
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch projects list
  const fetchProjects = async () => {
    try {
      const res = await apiFetch('/api/projects');
      if (res.success && res.data?.items) {
        setProjects(res.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setFetchingProjects(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated]);

  const handleCreateProject = async (projectData: {
    project_name: string;
    project_type: string;
    category: string;
    description: string;
  }) => {
    const res = await apiFetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    if (res.success) {
      fetchProjects();
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setDeletingId(projectId);
    try {
      const res = await apiFetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setProjects(projects.filter((p) => p.id !== projectId));
        setProjectToDelete(null);
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Layout (CMP-002) */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
        <div className="p-6 space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-base shadow-md shadow-indigo-500/10">
              AI
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              DevMentor
            </span>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-slate-800/80 border-l-2 border-indigo-500 rounded-r-lg transition-all"
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
            <Link 
              href="/settings" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-lg transition-all"
            >
              ⚙️ Settings
            </Link>
          </nav>
        </div>

        {/* User Card */}
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

      {/* Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/30 backdrop-blur-md px-6 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-200">My Workspace</h1>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <span>+</span> New Project
            </button>
            <button 
              onClick={logout}
              className="md:hidden text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Workspace Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {fetchingProjects ? (
            <div className="h-full flex items-center justify-center">
              <span className="h-8 w-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            /* Empty State (CMP-008) */
            <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6 py-12">
              <div className="text-6xl">📁</div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">No projects found</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Start your first mentoring journey. Create a project and let the AI guide you through discovery and roadmaps.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
              >
                Create Your First Project
              </button>
            </div>
          ) : (
            /* Project Grid */
            <div className="max-w-7xl mx-auto space-y-6">
              <h2 className="text-xl font-bold text-white">Active Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div 
                    key={project.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/20 transition-all hover:bg-slate-900/80 relative flex flex-col justify-between h-48 group cursor-pointer"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate max-w-[180px]">
                            {project.project_name}
                          </h3>
                          <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/20">
                            {project.project_type}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete(project);
                          }}
                          className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-950 transition-all"
                          title="Delete Project"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-4 leading-normal">
                        {project.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span>Updated: {new Date(project.updated_at).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full" 
                            style={{ width: `${project.requirement_completion_percentage}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-300">{project.requirement_completion_percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Project Modal */}
      <NewProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />

      {/* Confirmation Modal for Delete (CMP-011) */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Delete Project?</h3>
            <p className="text-sm text-slate-400 leading-normal">
              Are you sure you want to delete <strong className="text-slate-200">"{projectToDelete.project_name}"</strong>? This will permanently remove all associated chat history and generated documentation.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteProject(projectToDelete.id)}
                disabled={deletingId !== null}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-all"
              >
                {deletingId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
