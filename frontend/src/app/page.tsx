'use client';

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function LandingPage() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header / Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-500/20">
              AI
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              DevMentor
            </span>
          </div>

          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={() => logout()}
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-all"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden py-20">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 text-xs font-semibold tracking-wider uppercase animate-pulse">
            ✨ Intelligent AI Mentorship
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Build Your Next Web Project <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-500 bg-clip-text text-transparent">
              With A Structured Mentor
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            AI DevMentor guides you from initial idea validation, requirement discovery, tech stack decisions, all the way to complete PRD & roadmap generation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all duration-200 hover:-translate-y-0.5"
            >
              Start Planning Now
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <section className="max-w-7xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 px-4 w-full">
          <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl text-left hover:border-indigo-500/30 transition-all hover:bg-slate-900/60 group">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl font-bold mb-6 group-hover:scale-110 transition-transform">
              💬
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Requirement Gathering</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Answer structured, context-aware questions one-by-one to detect project gaps and build scope.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl text-left hover:border-violet-500/30 transition-all hover:bg-slate-900/60 group">
            <div className="h-12 w-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center text-xl font-bold mb-6 group-hover:scale-110 transition-transform">
              ⚙️
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Stack Recommendation</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Get customized frontend, backend, database, and infrastructure suggestions aligned with your project.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl text-left hover:border-pink-500/30 transition-all hover:bg-slate-900/60 group">
            <div className="h-12 w-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center text-xl font-bold mb-6 group-hover:scale-110 transition-transform">
              📄
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">PRD & Docs Generation</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Export high-quality Product Requirements Documents, roadmaps, use cases, and user stories in Markdown.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-slate-500 text-xs">
        <p>&copy; {new Date().getFullYear()} AI DevMentor. All rights reserved.</p>
      </footer>
    </div>
  );
}
